package com.internlink.core.application.auth;

import com.internlink.core.domain.auth.User;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface RefreshTokenService {

    /**
     * Khởi tạo Session Family mới và cấp Refresh Token đầu tiên (gắn vào cookie).
     */
    String createSessionAndToken(User user, HttpServletRequest request, HttpServletResponse response);

    /**
     * Xoay vòng Refresh Token (Token Rotation) và phát hiện hành vi tái sử dụng (Replay Detection).
     */
    AuthResponse rotateRefreshToken(HttpServletRequest request, HttpServletResponse response);

    /**
     * Thu hồi Session Family hiện tại khi người dùng logout.
     */
    void revokeSession(HttpServletRequest request, HttpServletResponse response);
}
