package com.internlink.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.internlink.core.application.auth.impl.AuthServiceImpl;
import com.internlink.core.application.company.impl.CompanyServiceImpl;
import com.internlink.core.application.exception_case.impl.InternshipCaseServiceImpl;
import com.internlink.core.application.organization.impl.*;
import com.internlink.core.application.placement.impl.*;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.application.system.impl.AuditLogServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.*;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenRevocationService;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.company.dto.request.CompanyRequest;
import com.internlink.core.presentation.exception_case.dto.request.InternshipCaseRequest;
import com.internlink.core.presentation.organization.dto.request.*;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.AccountLockedException;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.UnauthorizedException;
import com.internlink.core.shared.security.SecurityGuard;

import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

class CoreAuthServicesTest extends CoreServiceTestFixture {
    @Test
    void authMapsBadCredentialsToDomainUnauthorizedException() {
        AuthServiceImpl service =
                new AuthServiceImpl(authenticationManager, jwtUtil, cookieUtils, userRepository, companyRepository, passwordEncoder, notificationService, tokenRevocationService);
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
                new AuthServiceImpl(authenticationManager, jwtUtil, cookieUtils, userRepository, companyRepository, passwordEncoder, notificationService, tokenRevocationService);

        assertThatThrownBy(service::getCurrentUser).isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void authLocksAccountAfterFiveFailedAttempts() {
        AuthServiceImpl service =
                new AuthServiceImpl(authenticationManager, jwtUtil, cookieUtils, userRepository, companyRepository, passwordEncoder, notificationService, tokenRevocationService);
        User user = User.builder()
                .email("user@example.com")
                .failedLoginAttempts(4)
                .isActive(true)
                .build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(
                () -> service.login(
                        LoginRequest.builder().email("user@example.com").password("wrong").build(),
                        servletResponse))
                .isInstanceOf(AccountLockedException.class);

        assertThat(user.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(user.getLockedUntil()).isNotNull();
    }

    @Test
    void authRejectsAlreadyLockedAccount() {
        AuthServiceImpl service =
                new AuthServiceImpl(authenticationManager, jwtUtil, cookieUtils, userRepository, companyRepository, passwordEncoder, notificationService, tokenRevocationService);
        User user = User.builder()
                .email("user@example.com")
                .failedLoginAttempts(5)
                .lockedUntil(OffsetDateTime.now().plusMinutes(10))
                .isActive(true)
                .build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(
                () -> service.login(
                        LoginRequest.builder().email("user@example.com").password("any").build(),
                        servletResponse))
                .isInstanceOf(AccountLockedException.class);

        verify(authenticationManager, never()).authenticate(any());
    }

}
