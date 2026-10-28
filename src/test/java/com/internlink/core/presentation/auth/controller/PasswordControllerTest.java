package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.PasswordManagementService;
import com.internlink.core.application.auth.PasswordResetService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.auth.dto.request.ChangePasswordRequest;
import com.internlink.core.presentation.auth.dto.request.ForgotPasswordRequest;
import com.internlink.core.presentation.auth.dto.request.ResetPasswordRequest;
import com.internlink.core.shared.api.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordControllerTest {

    @Mock
    private PasswordManagementService passwordManagementService;

    @Mock
    private PasswordResetService passwordResetService;

    private PasswordController controller;

    @BeforeEach
    void setUp() {
        controller = new PasswordController(passwordManagementService, passwordResetService,
                new com.internlink.core.infrastructure.security.CookieUtils(new com.internlink.core.infrastructure.security.CookieProperties()));
    }

    @Test
    void shouldDelegateChangePasswordToService() {
        UUID userId = UUID.randomUUID();
        CustomUserDetail principal = CustomUserDetail.builder().id(userId).build();

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPass123")
                .newPassword("NewPass123")
                .confirmPassword("NewPass123")
                .build();

        ResponseEntity<ApiResponse<Void>> response = controller.changePassword(principal, request, new org.springframework.mock.web.MockHttpServletResponse());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).contains("thành công");
        verify(passwordManagementService).changePassword(userId, request);
    }

    @Test
    void shouldDelegateForgotPasswordToService() {
        ForgotPasswordRequest request = ForgotPasswordRequest.builder()
                .email("user@internlink.vn")
                .build();

        ResponseEntity<ApiResponse<Void>> response = controller.forgotPassword(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        verify(passwordResetService).forgotPassword(request);
    }

    @Test
    void shouldDelegateResetPasswordToService() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("valid-reset-token")
                .newPassword("NewPass123")
                .confirmPassword("NewPass123")
                .build();

        ResponseEntity<ApiResponse<Void>> response = controller.resetPassword(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        verify(passwordResetService).resetPassword(request);
    }
}
