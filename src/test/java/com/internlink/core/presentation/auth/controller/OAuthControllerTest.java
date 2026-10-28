package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.GoogleAuthService;
import com.internlink.core.presentation.auth.dto.request.GoogleLoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
class OAuthControllerTest {

    @Mock
    private GoogleAuthService googleAuthService;

    @Mock
    private HttpServletRequest httpRequest;

    @Mock
    private HttpServletResponse response;

    private OAuthController controller;

    @BeforeEach
    void setUp() {
        controller = new OAuthController(googleAuthService, mock(com.internlink.core.application.auth.GoogleAccountLinkService.class));
    }

    @Test
    void shouldDelegateGoogleLoginToService() {
        GoogleLoginRequest request = new GoogleLoginRequest("google-id-token-xyz");
        AuthResponse authResponse = AuthResponse.builder()
                .userId(UUID.randomUUID())
                .email("student@internlink.vn")
                .fullName("Nguyen Van A")
                .role(UserRole.STUDENT)
                .build();

        when(googleAuthService.authenticateWithGoogle(request, httpRequest, response)).thenReturn(authResponse);

        ResponseEntity<ApiResponse<AuthResponse>> result = controller.googleLogin(request, httpRequest, response);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getData()).isEqualTo(authResponse);
        verify(googleAuthService).authenticateWithGoogle(request, httpRequest, response);
    }
}
