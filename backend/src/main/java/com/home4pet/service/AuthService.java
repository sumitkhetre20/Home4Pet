package com.home4pet.service;

import com.home4pet.dto.request.ChangePasswordRequest;
import com.home4pet.dto.request.LoginRequest;
import com.home4pet.dto.request.RegisterRequest;
import com.home4pet.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void changePassword(ChangePasswordRequest request);
}
