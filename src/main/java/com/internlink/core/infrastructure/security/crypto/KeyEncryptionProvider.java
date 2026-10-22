package com.internlink.core.infrastructure.security.crypto;

/**
 * Giao diện quản lý việc bọc và mở khóa DEK (Key Wrapping/Unwrapping)
 * bởi KEK (Key Encryption Key) từ RSA, AWS KMS hoặc HashiCorp Vault.
 */
public interface KeyEncryptionProvider {

    /**
     * Định danh của Master Key (KEK) hiện tại.
     */
    String getKeyId();

    /**
     * Tên thuật toán bọc khóa (ví dụ: RSA-OAEP-SHA256-MGF1SHA256).
     */
    String getWrapAlgorithm();

    /**
     * Bọc (mã hóa) khóa DEK đối xứng bằng KEK.
     */
    byte[] wrapKey(byte[] plaintextDek);

    /**
     * Mở (giải mã) khóa DEK đối xứng bằng KEK.
     */
    byte[] unwrapKey(byte[] wrappedDek);
}
