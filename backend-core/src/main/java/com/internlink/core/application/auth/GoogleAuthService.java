package com.internlink.core.application.auth;

import com.internlink.core.presentation.auth.dto.request.GoogleLoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface GoogleAuthService {

    /**
     * Xác thực Google ID Token, tự động liên kết tài khoản hoặc đăng ký mới, sau đó cấp phiên đăng nhập.
     *
     * @param request  DTO chứa ID Token nhận từ Google Identity Services
     * @param httpRequest HTTP request hiện tại
     * @param response HTTP response để đính kèm cookie
     * @return AuthResponse
     */
    AuthResponse authenticateWithGoogle(GoogleLoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response);
}
