package com.internlink.core.infrastructure.security;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Sinh ngẫu nhiên CSPRNG và băm SHA-256 an toàn
 * cho các mã bảo mật (Refresh Token, Password Reset Token).
 */
@Component
public class TokenCryptoUtils {

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Sinh chuỗi ngẫu nhiên 32 byte an toàn (CSPRNG), mã hóa Base64 URL-safe không padding.
     */
    public String generateSecureRandomToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Tính toán mã băm SHA-256 (64 ký tự Hex) từ chuỗi token thô.
     */
    public String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Token không được để trống khi tính hash");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Thuật toán SHA-256 không khả dụng trên JVM", e);
        }
    }
}
