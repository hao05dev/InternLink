package com.internlink.core.infrastructure.security;

import com.internlink.core.shared.enums.UserRole;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION_MS = 3600000L; // 1 giờ

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(TEST_SECRET, EXPIRATION_MS);
    }

    @Test
    void shouldGenerateValidTokenWithCorrectClaims() {
        UUID userId = UUID.randomUUID();
        CustomUserDetail principal = CustomUserDetail.builder()
                .id(userId)
                .email("student@internlink.vn")
                .fullName("Nguyen Van A")
                .role(UserRole.STUDENT)
                .authorities(List.of())
                .isActive(true)
                .build();

        String token = jwtUtil.generateToken(principal);

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.validateToken(token)).isTrue();
        assertThat(jwtUtil.getUserIdFromToken(token)).isEqualTo(userId);
        assertThat(jwtUtil.getJtiFromToken(token)).isNotBlank();

        Claims claims = jwtUtil.getClaimsFromToken(token);
        assertThat(claims.get("email")).isEqualTo("student@internlink.vn");
        assertThat(claims.get("fullName")).isEqualTo("Nguyen Van A");
        assertThat(claims.get("role")).isEqualTo("STUDENT");
        assertThat(jwtUtil.getIssuedAtFromToken(token)).isNotNull();
        assertThat(jwtUtil.getExpirationDateFromToken(token)).isNotNull();
    }

    @Test
    void shouldRejectExpiredToken() {
        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .expiration(new java.util.Date(System.currentTimeMillis() - 1000))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        TEST_SECRET.getBytes(java.nio.charset.StandardCharsets.UTF_8))).compact();

        assertThat(jwtUtil.validateToken(expiredToken)).isFalse();
    }

    @Test
    void shouldRejectTamperedToken() {
        UUID userId = UUID.randomUUID();
        CustomUserDetail principal = CustomUserDetail.builder()
                .id(userId)
                .email("user@internlink.vn")
                .fullName("User")
                .role(UserRole.STUDENT)
                .authorities(List.of())
                .isActive(true)
                .build();

        String validToken = jwtUtil.generateToken(principal);
        // Thay đổi ký tự payload của token để phá hủy chữ ký HMAC
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "abcde";

        assertThat(jwtUtil.validateToken(tamperedToken)).isFalse();
    }

    @Test
    void shouldRejectMalformedToken() {
        assertThat(jwtUtil.validateToken("not-a-valid-jwt-token")).isFalse();
        assertThat(jwtUtil.validateToken("")).isFalse();
        assertThat(jwtUtil.validateToken(null)).isFalse();
    }
}
