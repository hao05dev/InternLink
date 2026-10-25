package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.AuthService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.internlink.core.presentation.auth.dto.request.RegisterCompanyRequest;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, httpRequest, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    @PostMapping("/register/company")
    public ResponseEntity<ApiResponse<AuthResponse>> registerCompany(
            @Valid @RequestBody RegisterCompanyRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.registerCompany(request, response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản doanh nghiệp thành công", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser() {
        UserSummaryDto userSummary = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userSummary));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getSession(
        @AuthenticationPrincipal CustomUserDetail principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            principal == null ? null : authService.getCurrentUser()
        ));
    }
}
