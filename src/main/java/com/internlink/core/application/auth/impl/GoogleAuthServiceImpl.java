package com.internlink.core.application.auth.impl;

import com.internlink.core.application.auth.GoogleAuthService;
import com.internlink.core.application.auth.RefreshTokenService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.GoogleTokenVerifier;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.presentation.auth.dto.request.GoogleLoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.AccountLockedException;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Phối hợp xác thực tài khoản Google OAuth,
 * liên kết tài khoản nội bộ và phát hành phiên làm việc an toàn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private final JpaUserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;
    private final CookieUtils cookieUtils;
    private final PasswordEncoder passwordEncoder;
    private final GoogleTokenVerifier tokenVerifier;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.internlink.core.application.system.AuditLogService auditLogService;

    @Override
    @Transactional
    public AuthResponse authenticateWithGoogle(
            GoogleLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        GoogleTokenVerifier.GoogleUserInfo googleUser = tokenVerifier.verify(request.getIdToken());

        if (!googleUser.emailVerified()) {
            throw new UnauthorizedException("Email tài khoản Google chưa được xác thực");
        }

        String cleanEmail = googleUser.email().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByGoogleSubject(googleUser.sub());

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            Optional<User> existingByEmail = userRepository.findByEmail(cleanEmail);
            if (existingByEmail.isPresent()) {
                user = existingByEmail.get();
                user.setGoogleSubject(googleUser.sub());
                if (user.getEmailVerifiedAt() == null) {
                    user.setEmailVerifiedAt(OffsetDateTime.now());
                }
                user = userRepository.save(user);
            } else {
                // Tự động khởi tạo tài khoản mới cho người dùng Google (mặc định STUDENT)
                user = User.builder()
                        .email(cleanEmail)
                        .fullName(googleUser.name() != null ? googleUser.name().trim() : cleanEmail)
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .authProvider("GOOGLE")
                        .googleSubject(googleUser.sub())
                        .emailVerifiedAt(OffsetDateTime.now())
                        .role(UserRole.STUDENT)
                        .mustChangePassword(false)
                        .isActive(true)
                        .failedLoginAttempts(0)
                        .build();
                user = userRepository.save(user);
                log.info("Đã tạo mới tài khoản qua Google OAuth cho email [{}]", cleanEmail);
            }
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt");
        }
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(OffsetDateTime.now())) {
            throw new AccountLockedException("Tài khoản đang bị tạm khóa. Vui lòng thử lại sau.");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        CustomUserDetail principal = CustomUserDetail.create(user);
        String accessToken = jwtUtil.generateToken(principal);

        ResponseCookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken, jwtUtil.getExpirationMs());
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        refreshTokenService.createSessionAndToken(user, httpRequest, response);

        if (auditLogService != null) {
            try {
                String ip = extractClientIp(httpRequest);
                String ua = httpRequest != null ? httpRequest.getHeader("User-Agent") : null;
                java.util.Map<String, Object> authMeta = new java.util.HashMap<>();
                authMeta.put("email", user.getEmail());
                authMeta.put("role", user.getRole() != null ? user.getRole().name() : "STUDENT");
                authMeta.put("authMethod", "GOOGLE");

                auditLogService.logAction(
                    user.getId(),
                    "USER_LOGIN",
                    "USER",
                    user.getId(),
                    "SUCCESS",
                    authMeta,
                    ip,
                    ua,
                    authMeta
                );
            } catch (Exception ex) {
                log.debug("Lỗi ghi audit log Google login: {}", ex.getMessage());
            }
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .mustChangePassword(user.getMustChangePassword())
                .build();
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getHeader("Proxy-Client-IP");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        return (ip != null && ip.contains(",")) ? ip.split(",")[0].trim() : ip;
    }
}
