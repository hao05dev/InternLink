package com.internlink.core.infrastructure.security.crypto;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.security.*;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Slf4j
@Component
@RequiredArgsConstructor
public class RsaKeyEncryptionProvider implements KeyEncryptionProvider {

    private static final String TRANSFORMATION = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
    private static final String WRAP_ALGORITHM_NAME = "RSA-OAEP-SHA256-MGF1SHA256";

    private final CryptoProperties cryptoProperties;

    private PublicKey publicKey;
    private PrivateKey privateKey;

    @PostConstruct
    public void init() {
        try {
            if (hasConfiguredKeys()) {
                this.publicKey = parsePublicKey(cryptoProperties.getRsaPublicKey());
                this.privateKey = parsePrivateKey(cryptoProperties.getRsaPrivateKey());
                log.info("Khởi tạo RsaKeyEncryptionProvider thành công với khóa cấu hình (KeyId: {})", getKeyId());
            } else {
                KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
                generator.initialize(2048);
                KeyPair pair = generator.generateKeyPair();
                this.publicKey = pair.getPublic();
                this.privateKey = pair.getPrivate();
                log.warn("Chưa cấu hình khóa RSA trong application.yml/env. Đã tự sinh cặp khóa in-memory 2048-bit phục vụ dev/test (KeyId: {})", getKeyId());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Không thể khởi tạo RsaKeyEncryptionProvider", e);
        }
    }

    private boolean hasConfiguredKeys() {
        return cryptoProperties.getRsaPublicKey() != null && !cryptoProperties.getRsaPublicKey().isBlank()
                && cryptoProperties.getRsaPrivateKey() != null && !cryptoProperties.getRsaPrivateKey().isBlank();
    }

    @Override
    public String getKeyId() {
        return cryptoProperties.getKeyId();
    }

    @Override
    public String getWrapAlgorithm() {
        return WRAP_ALGORITHM_NAME;
    }

    @Override
    public byte[] wrapKey(byte[] plaintextDek) {
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                    "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
            cipher.init(Cipher.ENCRYPT_MODE, publicKey, oaepParams);
            return cipher.doFinal(plaintextDek);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Lỗi khi bọc khóa DEK bằng RSA-OAEP", e);
        }
    }

    @Override
    public byte[] unwrapKey(byte[] wrappedDek) {
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                    "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
            cipher.init(Cipher.DECRYPT_MODE, privateKey, oaepParams);
            return cipher.doFinal(wrappedDek);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Lỗi khi giải bọc khóa DEK bằng RSA-OAEP", e);
        }
    }

    private PublicKey parsePublicKey(String keyStr) throws Exception {
        String cleaned = cleanKeyString(keyStr)
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "");
        byte[] bytes = Base64.getDecoder().decode(cleaned);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePublic(new X509EncodedKeySpec(bytes));
    }

    private PrivateKey parsePrivateKey(String keyStr) throws Exception {
        String cleaned = cleanKeyString(keyStr)
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "");
        byte[] bytes = Base64.getDecoder().decode(cleaned);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(bytes));
    }

    private String cleanKeyString(String key) {
        return key.replaceAll("\\s+", "");
    }
}
