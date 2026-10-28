package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.PasswordManagementService;
import com.internlink.core.application.auth.PasswordResetService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.auth.dto.request.ChangePasswordRequest;
import com.internlink.core.presentation.auth.dto.request.ForgotPasswordRequest;
import com.internlink.core.presentation.auth.dto.request.ResetPasswordRequest;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Phân phối các yêu cầu HTTP liên quan đến đổi và khôi phục mật khẩu.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordManagementService passwordManagementService;
    private final PasswordResetService passwordResetService;
    private final com.internlink.core.infrastructure.security.CookieUtils cookies;

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetail principal,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse response) {
        passwordManagementService.changePassword(principal.getId(), request);
        response.addHeader("Set-Cookie", cookies.deleteAccessTokenCookie().toString());
        response.addHeader("Set-Cookie", cookies.deleteRefreshTokenCookie().toString());
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.", null));
    }
}
