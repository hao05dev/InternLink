package com.internlink.core.application.auth.impl;

import com.internlink.core.application.auth.RefreshTokenService;
import com.internlink.core.domain.auth.AuthSessionFamily;
import com.internlink.core.domain.auth.RefreshToken;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaRefreshTokenRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenCryptoUtils;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Quản lý vòng đời Refresh Token, xoay vòng nguyên tử
 * và phát hiện replay attack theo chuẩn OAuth BCP RFC 9700.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final JpaAuthSessionFamilyRepository familyRepository;
    private final JpaRefreshTokenRepository tokenRepository;
    private final TokenCryptoUtils cryptoUtils;
    private final CookieUtils cookieUtils;
    private final JwtUtil jwtUtil;
    private final com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository users;

    private static final long IDLE_TTL_DAYS = 7;
    private static final long ABSOLUTE_TTL_DAYS = 30;

    @Override
    @Transactional
    public String createSessionAndToken(User user, HttpServletRequest request, HttpServletResponse response) {
        User current = users.findByIdForUpdate(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không còn hiệu lực"));
        if (!Boolean.TRUE.equals(current.getIsActive())
                || !java.util.Objects.equals(current.getPasswordChangedAt(), user.getPasswordChangedAt())
                || current.getLockedUntil() != null && current.getLockedUntil().isAfter(OffsetDateTime.now())) {
            throw new UnauthorizedException("Thông tin tài khoản đã thay đổi. Vui lòng đăng nhập lại.");
        }
        user = current;
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime absoluteExpiresAt = now.plusDays(ABSOLUTE_TTL_DAYS);

        AuthSessionFamily family = AuthSessionFamily.builder()
                .user(user)
                .userAgent(extractHeader(request, "User-Agent", 500))
                .ipAddress(extractClientIp(request))
                .absoluteExpiresAt(absoluteExpiresAt)
                .build();
        AuthSessionFamily savedFamily = familyRepository.save(family);

        String rawToken = cryptoUtils.generateSecureRandomToken();
        String tokenHash = cryptoUtils.hashToken(rawToken);
        OffsetDateTime tokenExpiresAt = calculateTokenExpiry(now, absoluteExpiresAt);

        RefreshToken token = RefreshToken.builder()
                .family(savedFamily)
                .tokenHash(tokenHash)
                .issuedAt(now)
                .expiresAt(tokenExpiresAt)
                .build();
        tokenRepository.save(token);

        long maxAgeSeconds = Duration.between(now, tokenExpiresAt).getSeconds();
        com.internlink.core.infrastructure.security.AuthCookieWriter.add(response, HttpHeaders.SET_COOKIE,
                cookieUtils.createRefreshTokenCookie(rawToken, maxAgeSeconds).toString());

        return rawToken;
    }

    @Override
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public AuthResponse rotateRefreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = cookieUtils.extractRefreshTokenFromCookie(request)
                .orElseThrow(() -> new UnauthorizedException("Không tìm thấy refresh token trong yêu cầu"));

        String tokenHash = cryptoUtils.hashToken(rawToken);
        Optional<RefreshToken> tokenOpt = tokenRepository.findByTokenHashWithFamilyAndUser(tokenHash);

        if (tokenOpt.isEmpty()) {
            clearCookies(response);
            throw new UnauthorizedException("Phiên làm việc không hợp lệ hoặc đã hết hạn");
        }

        RefreshToken currentToken = tokenOpt.get();
        AuthSessionFamily family = currentToken.getFamily();
        User user = family.getUser();
        OffsetDateTime now = OffsetDateTime.now();

        // 1. Replay Detection: Token đã từng được dùng -> Bị tấn công phát lại
        if (currentToken.isConsumed()) {
            family.setRevokedAt(now);
            family.setRevokeReason("REPLAY_DETECTED");
            familyRepository.save(family);
            clearCookies(response);
            log.error("CẢNH BÁO AN NINH: Phát hiện Replay Attack trên Session Family [{}], User [{}]",
                    family.getId(), user.getId());
            throw new UnauthorizedException("Phát hiện bất thường trong phiên đăng nhập. Vui lòng đăng nhập lại.");
        }

        // 2. Kiểm tra tính hợp lệ của Token, Family và Trạng thái tài khoản
        if (currentToken.isExpired() || family.isRevoked() || family.isExpired()
                || !Boolean.TRUE.equals(user.getIsActive())
                || user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)
                || user.getPasswordChangedAt() != null && currentToken.getIssuedAt().isBefore(user.getPasswordChangedAt())) {
            clearCookies(response);
            throw new UnauthorizedException("Phiên làm việc đã hết hạn hoặc không còn hiệu lực");
        }

        // 3. Xoay vòng (Rotation) nguyên tử: Cấp token mới và đánh dấu token cũ
        String newRawToken = cryptoUtils.generateSecureRandomToken();
        String newTokenHash = cryptoUtils.hashToken(newRawToken);
        OffsetDateTime newTokenExpiresAt = calculateTokenExpiry(now, family.getAbsoluteExpiresAt());

        RefreshToken newToken = RefreshToken.builder()
                .family(family)
                .tokenHash(newTokenHash)
                .issuedAt(now)
                .expiresAt(newTokenExpiresAt)
                .build();
        RefreshToken savedNewToken = tokenRepository.save(newToken);

        currentToken.setConsumedAt(now);
        currentToken.setReplacedById(savedNewToken.getId());
        tokenRepository.save(currentToken);

        // 4. Phát hành access token mới và cập nhật cookies
        CustomUserDetail principal = CustomUserDetail.create(user);
        String newAccessToken = jwtUtil.generateToken(principal);

        com.internlink.core.infrastructure.security.AuthCookieWriter.add(response, HttpHeaders.SET_COOKIE,
                cookieUtils.createAccessTokenCookie(newAccessToken, jwtUtil.getExpirationMs()).toString());
        long maxAgeSeconds = Duration.between(now, newTokenExpiresAt).getSeconds();
        com.internlink.core.infrastructure.security.AuthCookieWriter.add(response, HttpHeaders.SET_COOKIE,
                cookieUtils.createRefreshTokenCookie(newRawToken, maxAgeSeconds).toString());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .mustChangePassword(user.getMustChangePassword())
                .build();
    }

    @Override
    @Transactional
    public void revokeSession(HttpServletRequest request, HttpServletResponse response) {
        cookieUtils.extractRefreshTokenFromCookie(request).ifPresent(rawToken -> {
            try {
                String tokenHash = cryptoUtils.hashToken(rawToken);
                tokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                    AuthSessionFamily family = token.getFamily();
                    if (family != null && family.getRevokedAt() == null) {
                        family.setRevokedAt(OffsetDateTime.now());
                        family.setRevokeReason("USER_LOGOUT");
                        familyRepository.save(family);
                    }
                });
            } catch (Exception ex) {
                log.debug("Lỗi khi thu hồi refresh session khi logout: {}", ex.getMessage());
            }
        });
        clearCookies(response);
    }

    private OffsetDateTime calculateTokenExpiry(OffsetDateTime now, OffsetDateTime absoluteExpiresAt) {
        OffsetDateTime idleExpiry = now.plusDays(IDLE_TTL_DAYS);
        return idleExpiry.isBefore(absoluteExpiresAt) ? idleExpiry : absoluteExpiresAt;
    }

    private void clearCookies(HttpServletResponse response) {
        com.internlink.core.infrastructure.security.AuthCookieWriter.add(response, HttpHeaders.SET_COOKIE, cookieUtils.deleteAccessTokenCookie().toString());
        com.internlink.core.infrastructure.security.AuthCookieWriter.add(response, HttpHeaders.SET_COOKIE, cookieUtils.deleteRefreshTokenCookie().toString());
    }

    private String extractHeader(HttpServletRequest request, String headerName, int maxLength) {
        if (request == null) return null;
        String val = request.getHeader(headerName);
        return (val != null && val.length() > maxLength) ? val.substring(0, maxLength) : val;
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return null;
        return request.getRemoteAddr();
    }
}
