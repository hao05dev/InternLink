package com.internlink.core.infrastructure.security.crypto;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Xây dựng dữ liệu xác thực bổ sung (AAD - Additional Authenticated Data)
 * để gắn chặt ciphertext với ngữ cảnh tài liệu, chống tấn công tráo đổi (swapping attack).
 */
@Component
public class AadBuilder {

    public byte[] buildAad(
            int formatVersion,
            UUID documentId,
            UUID ownerUserId,
            String contextType,
            UUID contextId,
            String documentType) {
        String canonical = String.format(
                "v%d|doc:%s|owner:%s|ctx:%s:%s|type:%s",
                formatVersion,
                documentId,
                ownerUserId,
                contextType,
                contextId,
                documentType
        );
        return canonical.getBytes(StandardCharsets.UTF_8);
    }

    public String computeDigestSha256(byte[] aad) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(aad);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Không tìm thấy thuật toán băm SHA-256", e);
        }
    }
}
