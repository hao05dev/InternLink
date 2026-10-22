package com.internlink.core.infrastructure.security.crypto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RsaKeyEncryptionProviderTest {

    private RsaKeyEncryptionProvider provider;

    @BeforeEach
    void setUp() {
        CryptoProperties properties = new CryptoProperties();
        properties.setKeyId("test-master-key-v1");
        provider = new RsaKeyEncryptionProvider(properties);
        provider.init();
    }

    @Test
    @DisplayName("Bọc và giải bọc DEK thành công bằng RSA-OAEP")
    void shouldWrapAndUnwrapDekSuccessfully() {
        byte[] dek = "01234567890123456789012345678901".getBytes(StandardCharsets.UTF_8); // 32 bytes

        byte[] wrappedDek = provider.wrapKey(dek);

        assertThat(wrappedDek).isNotNull();
        assertThat(wrappedDek.length).isGreaterThan(0);

        byte[] unwrappedDek = provider.unwrapKey(wrappedDek);
        assertThat(unwrappedDek).isEqualTo(dek);
    }

    @Test
    @DisplayName("Ném ngoại lệ khi giải bọc dữ liệu giả mạo")
    void shouldFailWhenWrappedDekIsInvalid() {
        byte[] invalidWrappedDek = new byte[256];

        assertThatThrownBy(() -> provider.unwrapKey(invalidWrappedDek))
                .isInstanceOf(IllegalStateException.class);
    }
}
