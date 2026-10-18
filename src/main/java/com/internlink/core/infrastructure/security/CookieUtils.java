package com.internlink.core.infrastructure.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.Optional;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Thao tác tạo, xóa và trích xuất Access Token Cookie.
 */
@Component
@RequiredArgsConstructor
public class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

    private final CookieProperties cookieProperties;

    public ResponseCookie createAccessTokenCookie(String token, long maxAgeMillis) {
        return buildCookie(ACCESS_TOKEN_COOKIE_NAME, token, maxAgeMillis / 1000);
    }

    public ResponseCookie deleteAccessTokenCookie() {
        return buildCookie(ACCESS_TOKEN_COOKIE_NAME, "", 0);
    }

    public ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds) {
        return buildCookie(REFRESH_TOKEN_COOKIE_NAME, token, maxAgeSeconds);
    }

    public ResponseCookie deleteRefreshTokenCookie() {
        return buildCookie(REFRESH_TOKEN_COOKIE_NAME, "", 0);
    }

    public Optional<String> extractTokenFromCookie(HttpServletRequest request) {
        return extractNamedCookie(request, ACCESS_TOKEN_COOKIE_NAME);
    }

    public Optional<String> extractRefreshTokenFromCookie(HttpServletRequest request) {
        return extractNamedCookie(request, REFRESH_TOKEN_COOKIE_NAME);
    }

    private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds) {
        var builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieProperties.isSecure())
                .path(cookieProperties.getPath())
                .maxAge(maxAgeSeconds)
                .sameSite(cookieProperties.getSameSite());

        if (StringUtils.hasText(cookieProperties.getDomain())) {
            builder.domain(cookieProperties.getDomain());
        }

        return builder.build();
    }

    private Optional<String> extractNamedCookie(HttpServletRequest request, String name) {
        if (request == null || request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .filter(val -> !val.isBlank())
                .findFirst();
    }
}