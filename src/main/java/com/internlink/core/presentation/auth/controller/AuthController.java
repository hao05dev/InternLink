package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.AuthService;
import com.internlink.core.common.ApiResponse;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser() {
        UserSummaryDto userSummary = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userSummary));
    }
}