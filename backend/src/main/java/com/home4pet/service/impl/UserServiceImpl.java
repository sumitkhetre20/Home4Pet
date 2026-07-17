package com.home4pet.service.impl;

import com.home4pet.dto.request.UpdateProfileRequest;
import com.home4pet.dto.request.UpdateUserRoleRequest;
import com.home4pet.dto.response.UserResponse;
import com.home4pet.entity.Role;
import com.home4pet.entity.User;
import com.home4pet.exception.BusinessException;
import com.home4pet.exception.ResourceNotFoundException;
import com.home4pet.mapper.UserMapper;
import com.home4pet.repository.RoleRepository;
import com.home4pet.repository.UserRepository;
import com.home4pet.service.UserService;
import com.home4pet.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(getUserEntity(SecurityUtils.getCurrentUserId()));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userMapper.toResponse(getUserEntity(id));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getUserEntity(SecurityUtils.getCurrentUserId());

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = getUserEntity(id);
        user.setActive(false);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse activateUser(Long id) {
        User user = getUserEntity(id);
        user.setActive(true);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = getUserEntity(id);
        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new BusinessException("Role not found: " + request.getRole()));

        user.getRoles().clear();
        user.getRoles().add(role);

        return userMapper.toResponse(userRepository.save(user));
    }

    private User getUserEntity(Long id) {
        return userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
