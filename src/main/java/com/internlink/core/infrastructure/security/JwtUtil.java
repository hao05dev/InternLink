package com.internlink.core.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${internlink.jwt.secret}") String secret,
            @Value("${internlink.jwt.expiration-ms:900000}") long expirationMs) {
        if (secret.isBlank() || secret.length() < 32 || expirationMs <= 0) {
            throw new IllegalStateException("JWT_SECRET cần ít nhất 32 ký tự và TTL phải dương");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(CustomUserDetail principal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(jti)
                .subject(principal.getId().toString())
                .claim("email", principal.getEmail())
                .claim("role", principal.getRole().name())
                .claim("fullName", principal.getFullName())
                .claim("securityStamp", principal.getPasswordChangedAt() == null
                        ? "initial" : principal.getPasswordChangedAt().toInstant().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(getClaimsFromToken(token).getSubject());
    }

    public String getJtiFromToken(String token) {
        return getClaimsFromToken(token).getId();
    }

    public String getSecurityStampFromToken(String token) {
        return getClaimsFromToken(token).get("securityStamp", String.class);
    }

    public Date getIssuedAtFromToken(String token) {
        return getClaimsFromToken(token).getIssuedAt();
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimsFromToken(token).getExpiration();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("JWT token không hợp lệ hoặc đã hết hạn: {}", ex.getMessage());
            return false;
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
