package com.internlink.core.infrastructure.security.crypto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "internlink.crypto")
public class CryptoProperties {

    /**
     * Bật / tắt tính năng mã hóa lai ở tầng ứng dụng.
     */
    private boolean enabled = true;

    /**
     * Định danh của Master Key (KEK) hiện tại.
     */
    private String keyId = "internlink-master-key-v1";

    /**
     * Thuật toán mã hóa đối xứng cho nội dung tài liệu.
     */
    private String dataAlgorithm = "AES/GCM/NoPadding";

    /**
     * Thuật toán bọc khóa DEK (Key Wrap).
     */
    private String wrapAlgorithm = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";

    /**
     * RSA Public Key dưới dạng chuỗi Base64 / PEM hoặc đường dẫn file.
     */
    private String rsaPublicKey;

    /**
     * RSA Private Key dưới dạng chuỗi Base64 / PEM hoặc đường dẫn file.
     */
    private String rsaPrivateKey;
}
