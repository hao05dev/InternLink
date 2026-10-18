package com.internlink.core.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TokenCryptoUtilsTest {

    private TokenCryptoUtils cryptoUtils;

    @BeforeEach
    void setUp() {
        cryptoUtils = new TokenCryptoUtils();
    }

    @Test
    void shouldGenerateUniqueRandomTokensWithHighEntropy() {
        Set<String> tokens = new HashSet<>();
        int count = 1000;

        for (int i = 0; i < count; i++) {
            String token = cryptoUtils.generateSecureRandomToken();
            assertThat(token).isNotBlank();
            // 32 byte base64 không padding có độ dài 43 ký tự
            assertThat(token.length()).isGreaterThanOrEqualTo(42);
            tokens.add(token);
        }

        // Đảm bảo không có trùng lặp trong 1000 token ngẫu nhiên
        assertThat(tokens).hasSize(count);
    }

    @Test
    void shouldComputeConsistentSha256HexHash() {
        String rawToken = "my-secret-refresh-token-12345";
        String hash1 = cryptoUtils.hashToken(rawToken);
        String hash2 = cryptoUtils.hashToken(rawToken);

        assertThat(hash1).isEqualTo(hash2);
        // SHA-256 Hex phải đúng 64 ký tự
        assertThat(hash1).hasSize(64);
        assertThat(hash1).matches("^[0-9a-f]{64}$");
    }

    @Test
    void shouldProduceDifferentHashesForDifferentInputs() {
        String hash1 = cryptoUtils.hashToken("token-a");
        String hash2 = cryptoUtils.hashToken("token-b");

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void shouldThrowExceptionWhenHashingNullOrBlank() {
        assertThatThrownBy(() -> cryptoUtils.hashToken(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> cryptoUtils.hashToken(""))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> cryptoUtils.hashToken("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
