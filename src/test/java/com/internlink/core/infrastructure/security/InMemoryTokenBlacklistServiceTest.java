package com.internlink.core.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class InMemoryTokenBlacklistServiceTest {

    private InMemoryTokenBlacklistService service;

    @BeforeEach
    void setUp() {
        service = new InMemoryTokenBlacklistService();
    }

    @Test
    void shouldRecognizeRevokedToken() {
        String jti = "token-uuid-123";
        Date expiry = new Date(System.currentTimeMillis() + 60000L); // Còn 1 phút

        assertThat(service.isRevoked(jti)).isFalse();

        service.revokeToken(jti, expiry);

        assertThat(service.isRevoked(jti)).isTrue();
    }

    @Test
    void shouldAutoExpireRevokedTokenAfterTtl() {
        String jti = "token-expired-456";
        Date pastExpiry = new Date(System.currentTimeMillis() - 1000L); // Đã hết hạn

        service.revokeToken(jti, pastExpiry);

        // Khi kiểm tra một token đã quá hạn, dịch vụ tự giải phóng và trả về false
        assertThat(service.isRevoked(jti)).isFalse();
    }

    @Test
    void shouldHandleNullOrBlankJtiGracefully() {
        assertThat(service.isRevoked(null)).isFalse();
        assertThat(service.isRevoked("")).isFalse();

        service.revokeToken(null, new Date());
        service.revokeToken("  ", new Date());

        assertThat(service.isRevoked(null)).isFalse();
    }
}
