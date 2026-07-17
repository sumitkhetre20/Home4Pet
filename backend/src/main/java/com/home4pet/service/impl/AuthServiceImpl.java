package com.home4pet.service.impl;

import com.home4pet.config.JwtProperties;
import com.home4pet.dto.request.ChangePasswordRequest;
import com.home4pet.dto.request.LoginRequest;
import com.home4pet.dto.request.RegisterRequest;
import com.home4pet.dto.response.AuthResponse;
import com.home4pet.entity.Role;
import com.home4pet.entity.User;
import com.home4pet.enums.RoleType;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.DuplicateResourceException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.UserMapper;
import com.home4pet.repository.RoleRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.security.UserPrincipal;
import com.home4pet.security.jwt.JwtTokenProvider;
import com.home4pet.service.AuthService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        RoleType roleType = request.getRole() != null ? request.getRole() : RoleType.ADOPTER;
        if (roleType == RoleType.ADMIN) {
            throw new BusinessException("Cannot self-register as ADMIN");
        }

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new BusinessException("Role not found: " + roleType));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .roles(Set.of(role))
                .build();

        user = userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtTokenProvider.generateToken(principal);

        return userMapper.toAuthResponse(token, jwtProperties.getExpirationMs(), user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid credentials"));
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtTokenProvider.generateToken(principal);

        return userMapper.toAuthResponse(token, jwtProperties.getExpirationMs(), user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserPrincipal principal = SecurityUtils.getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), principal.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
