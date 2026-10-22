package com.internlink.core.application.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.internlink.core.application.auth.impl.AuthServiceImpl;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenRevocationService;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.shared.exception.AccountLockedException;
import com.internlink.core.shared.exception.UnauthorizedException;

import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class CoreAuthServicesTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CookieUtils cookieUtils;

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private JpaCompanyRepository companyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    @Mock
    private TokenRevocationService tokenRevocationService;

    @Mock
    private HttpServletResponse servletResponse;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authMapsBadCredentialsToDomainUnauthorizedException() {
        AuthServiceImpl service =
                new AuthServiceImpl(
                        authenticationManager,
                        jwtUtil,
                        cookieUtils,
                        userRepository,
                        companyRepository,
                        passwordEncoder,
                        notificationService,
                        tokenRevocationService);
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(
                        () ->
                                service.login(
                                        LoginRequest.builder()
                                                .email("user@example.com")
                                                .password("secret")
                                                .build(),
                                        servletResponse))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void authCurrentUserRequiresAuthenticatedPrincipal() {
        AuthServiceImpl service =
                new AuthServiceImpl(
                        authenticationManager,
                        jwtUtil,
                        cookieUtils,
                        userRepository,
                        companyRepository,
                        passwordEncoder,
                        notificationService,
                        tokenRevocationService);

        assertThatThrownBy(service::getCurrentUser).isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void authLocksAccountAfterFiveFailedAttempts() {
        AuthServiceImpl service =
                new AuthServiceImpl(
                        authenticationManager,
                        jwtUtil,
                        cookieUtils,
                        userRepository,
                        companyRepository,
                        passwordEncoder,
                        notificationService,
                        tokenRevocationService);
        User user =
                User.builder()
                        .email("user@example.com")
                        .failedLoginAttempts(4)
                        .isActive(true)
                        .build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(
                        () ->
                                service.login(
                                        LoginRequest.builder()
                                                .email("user@example.com")
                                                .password("wrong")
                                                .build(),
                                        servletResponse))
                .isInstanceOf(AccountLockedException.class);

        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(user.getLockedUntil()).isNotNull();
    }

    @Test
    void authRejectsAlreadyLockedAccount() {
        AuthServiceImpl service =
                new AuthServiceImpl(
                        authenticationManager,
                        jwtUtil,
                        cookieUtils,
                        userRepository,
                        companyRepository,
                        passwordEncoder,
                        notificationService,
                        tokenRevocationService);
        User user =
                User.builder()
                        .email("user@example.com")
                        .failedLoginAttempts(5)
                        .lockedUntil(OffsetDateTime.now().plusMinutes(10))
                        .isActive(true)
                        .build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(
                        () ->
                                service.login(
                                        LoginRequest.builder()
                                                .email("user@example.com")
                                                .password("any")
                                                .build(),
                                        servletResponse))
                .isInstanceOf(AccountLockedException.class);

        verify(authenticationManager, never()).authenticate(any());
    }
}
