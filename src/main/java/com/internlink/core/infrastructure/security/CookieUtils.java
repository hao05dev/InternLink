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

    private final CookieProperties cookieProperties;

    public ResponseCookie createAccessTokenCookie(String token, long maxAgeMillis) {
        var builder = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieProperties.isSecure())
                .path(cookieProperties.getPath())
                .maxAge(maxAgeMillis / 1000)
                .sameSite(cookieProperties.getSameSite());

        if (StringUtils.hasText(cookieProperties.getDomain())) {
            builder.domain(cookieProperties.getDomain());
        }

        return builder.build();
    }

    public ResponseCookie deleteAccessTokenCookie() {
        var builder = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieProperties.isSecure())
                .path(cookieProperties.getPath())
                .maxAge(0)
                .sameSite(cookieProperties.getSameSite());

        if (StringUtils.hasText(cookieProperties.getDomain())) {
            builder.domain(cookieProperties.getDomain());
        }

        return builder.build();
    }

    public Optional<String> extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> ACCESS_TOKEN_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .filter(val -> !val.isBlank())
                .findFirst();
    }
}