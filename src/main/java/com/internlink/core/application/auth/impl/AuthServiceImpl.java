package com.internlink.core.application.auth.impl;

import com.internlink.core.application.auth.AuthService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenRevocationService;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import com.internlink.core.shared.exception.AccountLockedException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.company.Company;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.presentation.auth.dto.request.RegisterCompanyRequest;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.BadRequestException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CookieUtils cookieUtils;
    private final JpaUserRepository userRepository;
    private final JpaCompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final TokenRevocationService tokenRevocationService;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.internlink.core.application.auth.RefreshTokenService refreshTokenService;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.internlink.core.application.system.AuditLogService auditLogService;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.internlink.core.application.auth.CompanyRegistrationService companyRegistrationService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 15;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        return login(request, null, response);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        Optional<User> existingUserOpt = userRepository.findByEmail(cleanEmail);
        String ipAddress = extractClientIp(httpRequest);
        String userAgent = httpRequest != null ? httpRequest.getHeader("User-Agent") : null;

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            OffsetDateTime lockedUntil = existingUser.getLockedUntil();
            if (lockedUntil != null) {
                if (lockedUntil.isAfter(OffsetDateTime.now())) {
                    long secondsRemaining = Duration.between(OffsetDateTime.now(), lockedUntil).getSeconds();
                    long minutesRemaining = Math.max(1, (secondsRemaining + 59) / 60);
                    recordLoginAudit(existingUser.getId(), "USER_LOGIN_FAILED", "FAILURE", ipAddress, userAgent,
                            Map.of("attemptedEmail", cleanEmail, "reason", "Tài khoản đang bị tạm khóa"));
                    throw new AccountLockedException(
                        String.format("Tài khoản đã bị tạm khóa do nhập sai mật khẩu quá %d lần. Vui lòng thử lại sau %d phút.", MAX_FAILED_ATTEMPTS, minutesRemaining),
                        secondsRemaining
                    );
                } else {
                    existingUser.setFailedLoginAttempts(0);
                    existingUser.setLockedUntil(null);
                    userRepository.save(existingUser);
                }
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetail principal = (CustomUserDetail) authentication.getPrincipal();

            User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
            user.setLastLoginAt(OffsetDateTime.now());
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);

            String token = jwtUtil.generateToken(principal);
            ResponseCookie cookie = cookieUtils.createAccessTokenCookie(token, jwtUtil.getExpirationMs());
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            if (refreshTokenService != null) {
                refreshTokenService.createSessionAndToken(user, httpRequest, response);
            }

            recordLoginAudit(user.getId(), "USER_LOGIN", "SUCCESS", ipAddress, userAgent,
                    Map.of("email", user.getEmail(), "role", user.getRole().name(), "authMethod", "PASSWORD"));

            return AuthResponse.builder()
                .userId(principal.getId())
                .email(principal.getEmail())
                .fullName(principal.getFullName())
                .role(principal.getRole())
                .mustChangePassword(user.getMustChangePassword())
                .build();

        } catch (BadCredentialsException ex) {
            UUID userId = existingUserOpt.map(User::getId).orElse(null);
            recordLoginAudit(userId, "USER_LOGIN_FAILED", "FAILURE", ipAddress, userAgent,
                    Map.of("attemptedEmail", cleanEmail, "reason", "Sai email hoặc mật khẩu"));

            if (existingUserOpt.isPresent()) {
                User user = existingUserOpt.get();
                int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
                user.setFailedLoginAttempts(attempts);

                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    user.setLockedUntil(OffsetDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
                    userRepository.save(user);
                    log.warn("Tài khoản [{}] đã bị tạm khóa {} phút do nhập sai mật khẩu {} lần liên tiếp.", user.getEmail(), LOCKOUT_DURATION_MINUTES, MAX_FAILED_ATTEMPTS);
                    throw new AccountLockedException(
                        String.format("Tài khoản đã bị tạm khóa %d phút do nhập sai mật khẩu %d lần liên tiếp.", LOCKOUT_DURATION_MINUTES, MAX_FAILED_ATTEMPTS),
                        LOCKOUT_DURATION_MINUTES * 60
                    );
                }

                userRepository.save(user);
                int remaining = MAX_FAILED_ATTEMPTS - attempts;
                throw new UnauthorizedException(
                    String.format("Email hoặc mật khẩu không chính xác. Bạn còn %d lần thử trước khi tài khoản bị tạm khóa.", remaining)
                );
            }
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        } catch (DisabledException ex) {
            UUID userId = existingUserOpt.map(User::getId).orElse(null);
            recordLoginAudit(userId, "USER_LOGIN_FAILED", "FAILURE", ipAddress, userAgent,
                    Map.of("attemptedEmail", cleanEmail, "reason", "Tài khoản bị vô hiệu hóa"));
            throw new UnauthorizedException("Tài khoản đã bị khóa hoặc chưa kích hoạt");
        } catch (LockedException ex) {
            UUID userId = existingUserOpt.map(User::getId).orElse(null);
            recordLoginAudit(userId, "USER_LOGIN_FAILED", "FAILURE", ipAddress, userAgent,
                    Map.of("attemptedEmail", cleanEmail, "reason", "Tài khoản đang bị tạm khóa"));
            throw new AccountLockedException("Tài khoản đang bị tạm khóa hoặc bị vô hiệu hóa.");
        }
    }

    @Override
    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request, HttpServletResponse response) {
        if (companyRegistrationService != null) {
            return companyRegistrationService.registerCompany(request, response);
        }
        throw new IllegalStateException("CompanyRegistrationService chưa sẵn sàng");
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        if (request != null) {
            String token = extractToken(request);
            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                String jti = jwtUtil.getJtiFromToken(token);
                Date expiryDate = jwtUtil.getExpirationDateFromToken(token);
                tokenRevocationService.revokeToken(jti, expiryDate);
            }
            if (refreshTokenService != null) {
                refreshTokenService.revokeSession(request, response);
            }
            recordLogoutAudit(request);
        }
        ResponseCookie deleteCookie = cookieUtils.deleteAccessTokenCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        SecurityContextHolder.clearContext();
    }

    private void recordLoginAudit(UUID userId, String action, String result, String ip, String userAgent, Map<String, Object> meta) {
        if (auditLogService != null) {
            try {
                auditLogService.logAction(userId, action, "USER", userId, result, meta, ip, userAgent, meta);
            } catch (Exception ex) {
                log.debug("Lỗi ghi audit log đăng nhập: {}", ex.getMessage());
            }
        }
    }

    private void recordLogoutAudit(HttpServletRequest request) {
        if (auditLogService != null) {
            try {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof CustomUserDetail principal) {
                    auditLogService.logAction(
                        principal.getId(),
                        "USER_LOGOUT",
                        "USER",
                        principal.getId(),
                        "SUCCESS",
                        Map.of("email", principal.getEmail()),
                        extractClientIp(request),
                        request.getHeader("User-Agent"),
                        Map.of("email", principal.getEmail())
                    );
                }
            } catch (Exception ex) {
                log.debug("Lỗi ghi audit log đăng xuất: {}", ex.getMessage());
            }
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getHeader("Proxy-Client-IP");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return (ip != null && ip.contains(",")) ? ip.split(",")[0].trim() : ip;
    }

    private String extractToken(HttpServletRequest request) {
        Optional<String> tokenFromCookie = cookieUtils.extractTokenFromCookie(request);
        if (tokenFromCookie.isPresent()) {
            return tokenFromCookie.get();
        }
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetail principal)) {
            throw new UnauthorizedException("Người dùng chưa đăng nhập");
        }

        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        return UserSummaryDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phoneNumber(user.getPhoneNumber())
            .role(user.getRole())
            .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
            .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
            .mustChangePassword(user.getMustChangePassword())
            .lastLoginAt(user.getLastLoginAt())
            .isActive(user.getIsActive())
            .build();
    }
}
