package com.internlink.core.infrastructure.security.crypto;

/**
 * Kết quả sau khi mã hóa dữ liệu đối xứng bằng AES-256-GCM.
 */
public record EncryptedDataResult(
        byte[] ciphertextWithTag,
        byte[] nonce,
        byte[] tag,
        byte[] dek
) {}
