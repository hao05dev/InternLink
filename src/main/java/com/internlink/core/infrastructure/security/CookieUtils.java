package com.internlink.core.infrastructure.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
public class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";

    public ResponseCookie createAccessTokenCookie(String token, long maxAgeMillis) {
        return ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(false) // Đổi thành true khi chạy HTTPS trên production
                .path("/")
                .maxAge(maxAgeMillis / 1000)
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie deleteAccessTokenCookie() {
        return ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
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