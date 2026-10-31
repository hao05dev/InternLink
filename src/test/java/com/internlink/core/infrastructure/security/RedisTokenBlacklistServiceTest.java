package com.internlink.core.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisTokenBlacklistServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private InMemoryTokenBlacklistService fallbackService;

    private RedisTokenBlacklistService service;

    @BeforeEach
    void setUp() {
        service = new RedisTokenBlacklistService(redisTemplate, fallbackService, true);
    }

    @Test
    @DisplayName("Nên lưu token vào Redis với TTL tương ứng khi Redis hoạt động bình thường")
    void shouldRevokeTokenInRedisSuccessfully() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        Date futureExpiry = new Date(System.currentTimeMillis() + 60000); // 60 giây nữa
        service.revokeToken("jti-abc-123", futureExpiry);

        verify(valueOperations).set(eq("auth:blacklist:jti-abc-123"), eq("revoked"), anyLong(), eq(TimeUnit.SECONDS));
        verify(fallbackService, never()).revokeToken(anyString(), any());
    }

    @Test
    @DisplayName("Nên trả về true khi token tồn tại trong Redis Blacklist")
    void shouldReturnTrueWhenTokenExistsInRedis() {
        when(redisTemplate.hasKey("auth:blacklist:jti-valid")).thenReturn(true);

        boolean isRevoked = service.isRevoked("jti-valid");

        assertThat(isRevoked).isTrue();
        verify(fallbackService, never()).isRevoked(anyString());
    }

    @Test
    @DisplayName("Nên tự động Fallback về InMemory khi Redis gặp lỗi kết nối lúc thu hồi")
    void shouldFallbackToInMemoryOnRedisConnectionFailureDuringRevoke() {
        when(redisTemplate.opsForValue()).thenThrow(new RedisConnectionFailureException("Connection refused"));

        Date futureExpiry = new Date(System.currentTimeMillis() + 60000);
        service.revokeToken("jti-error-test", futureExpiry);

        verify(fallbackService).revokeToken(eq("jti-error-test"), eq(futureExpiry));
    }

    @Test
    @DisplayName("Nên tự động Fallback về InMemory khi Redis gặp lỗi kết nối lúc kiểm tra")
    void shouldFallbackToInMemoryOnRedisConnectionFailureDuringCheck() {
        when(redisTemplate.hasKey(anyString())).thenThrow(new RedisConnectionFailureException("Connection refused"));
        when(fallbackService.isRevoked("jti-fallback-check")).thenReturn(true);

        boolean isRevoked = service.isRevoked("jti-fallback-check");

        assertThat(isRevoked).isTrue();
        verify(fallbackService).isRevoked("jti-fallback-check");
    }

    @Test
    @DisplayName("Nên dùng trực tiếp InMemory khi Redis bị vô hiệu hóa qua cấu hình")
    void shouldUseInMemoryWhenRedisDisabled() {
        RedisTokenBlacklistService disabledService = new RedisTokenBlacklistService(null, fallbackService, false);

        disabledService.revokeToken("jti-disabled", new Date());
        verify(fallbackService).revokeToken(eq("jti-disabled"), any());

        disabledService.isRevoked("jti-disabled");
        verify(fallbackService).isRevoked("jti-disabled");
    }
}
