package com.internlink.core.application.auth;

import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.internlink.core.presentation.auth.dto.request.RegisterCompanyRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    AuthResponse registerCompany(RegisterCompanyRequest request, HttpServletResponse response);
    void logout(HttpServletRequest request, HttpServletResponse response);
    UserSummaryDto getCurrentUser();
}