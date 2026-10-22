package com.internlink.core.infrastructure.security.crypto;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;

/**
 * Đảm nhiệm mã hóa và giải mã dữ liệu nội dung tài liệu bằng thuật toán AES-256-GCM
 * kết hợp AAD để đảm bảo tính bí mật và toàn vẹn tuyệt đối.
 */
@Component
public class AesGcmDataCipher {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int AES_KEY_SIZE_BYTES = 32; // 256 bits
    private static final int GCM_IV_LENGTH_BYTES = 12; // 96 bits
    private static final int GCM_TAG_LENGTH_BITS = 128; // 16 bytes
    private static final int GCM_TAG_LENGTH_BYTES = 16;

    private final SecureRandom secureRandom = new SecureRandom();

    public byte[] generateDek() {
        byte[] dek = new byte[AES_KEY_SIZE_BYTES];
        secureRandom.nextBytes(dek);
        return dek;
    }

    public byte[] generateNonce() {
        byte[] nonce = new byte[GCM_IV_LENGTH_BYTES];
        secureRandom.nextBytes(nonce);
        return nonce;
    }

    public EncryptedDataResult encrypt(byte[] plaintext, byte[] aad) throws GeneralSecurityException {
        byte[] dek = generateDek();
        byte[] nonce = generateNonce();
        return encrypt(plaintext, dek, nonce, aad);
    }

    public EncryptedDataResult encrypt(byte[] plaintext, byte[] dek, byte[] nonce, byte[] aad)
            throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        SecretKeySpec keySpec = new SecretKeySpec(dek, "AES");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, nonce);

        cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);
        if (aad != null && aad.length > 0) {
            cipher.updateAAD(aad);
        }

        byte[] ciphertextWithTag = cipher.doFinal(plaintext);

        int tagOffset = ciphertextWithTag.length - GCM_TAG_LENGTH_BYTES;
        byte[] tag = Arrays.copyOfRange(ciphertextWithTag, tagOffset, ciphertextWithTag.length);

        return new EncryptedDataResult(ciphertextWithTag, nonce, tag, dek);
    }

    public byte[] decrypt(byte[] ciphertextWithTag, byte[] dek, byte[] nonce, byte[] aad)
            throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        SecretKeySpec keySpec = new SecretKeySpec(dek, "AES");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, nonce);

        cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);
        if (aad != null && aad.length > 0) {
            cipher.updateAAD(aad);
        }

        return cipher.doFinal(ciphertextWithTag);
    }
}
