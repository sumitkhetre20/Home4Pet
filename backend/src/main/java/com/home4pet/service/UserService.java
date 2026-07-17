package com.home4pet.service;

import com.home4pet.dto.request.UpdateProfileRequest;
import com.home4pet.dto.request.UpdateUserRoleRequest;
import com.home4pet.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse getCurrentUser();

    UserResponse getUserById(Long id);

    UserResponse updateProfile(UpdateProfileRequest request);

    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse deactivateUser(Long id);

    UserResponse activateUser(Long id);

    UserResponse updateUserRole(Long id, UpdateUserRoleRequest request);
}
