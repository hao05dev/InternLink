package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.RefreshTokenService;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Tiếp nhận yêu cầu gia hạn / xoay vòng Refresh Token.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class TokenController {

    private final RefreshTokenService refreshTokenService;

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = refreshTokenService.rotateRefreshToken(request, response);
        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công", authResponse));
    }
}
