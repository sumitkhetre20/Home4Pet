package com.home4pet.mapper;

import com.home4pet.dto.response.AuthResponse;
import com.home4pet.dto.response.UserResponse;
import com.home4pet.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .active(user.isActive())
                .roles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AuthResponse toAuthResponse(String token, long expiresIn, User user) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(toResponse(user))
                .build();
    }
}
