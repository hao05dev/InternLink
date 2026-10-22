package com.internlink.core.domain.system;

import com.internlink.core.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Lưu trữ siêu dữ liệu phong bì mã hóa lai (Envelope Encryption Metadata)
 * cho các tài liệu nhạy cảm được bảo vệ bằng AES-256-GCM và KEK (RSA/KMS).
 */
@Entity
@Table(name = "document_crypto_envelopes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCryptoEnvelope extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @Builder.Default
    @Column(name = "format_version", nullable = false)
    private Integer formatVersion = 1;

    @Builder.Default
    @Column(name = "data_algorithm", nullable = false, length = 50)
    private String dataAlgorithm = "AES-256-GCM";

    @Builder.Default
    @Column(name = "wrap_algorithm", nullable = false, length = 100)
    private String wrapAlgorithm = "RSA-OAEP-SHA256-MGF1SHA256";

    @Column(name = "key_id", nullable = false, length = 100)
    private String keyId;

    @Column(name = "wrapped_dek_b64", nullable = false, columnDefinition = "text")
    private String wrappedDekB64;

    @Column(name = "nonce_b64", nullable = false, length = 50)
    private String nonceB64;

    @Column(name = "tag_b64", nullable = false, length = 50)
    private String tagB64;

    @Column(name = "aad_digest_sha256", nullable = false, length = 64)
    private String aadDigestSha256;

    @Column(name = "ciphertext_size_bytes", nullable = false)
    private Long ciphertextSizeBytes;
}
