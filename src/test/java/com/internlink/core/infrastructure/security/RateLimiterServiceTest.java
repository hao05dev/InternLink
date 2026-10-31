package com.internlink.core.infrastructure.security;

import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RateLimiterServiceTest {

    private RateLimiterService service;
    private RateLimitProperties properties;

    @BeforeEach
    void setUp() {
        properties = new RateLimitProperties();
        properties.setLoginCapacity(2);
        properties.setUploadCapacity(5);
        properties.setAiCapacity(5);
        properties.setDefaultCapacity(10);
        service = new RateLimiterService(properties);
    }

    @Test
    @DisplayName("Nên cho phép các request trong hạn mức và từ chối khi vượt quá (InMemory)")
    void shouldAllowRequestsWithinCapacityAndRejectExceeded() {
        String clientIp = "192.168.1.100";

        // Request 1: Hợp lệ
        ConsumptionProbe probe1 = service.tryConsume(clientIp, RateLimiterService.LimitCategory.LOGIN);
        assertThat(probe1.isConsumed()).isTrue();
        assertThat(probe1.getRemainingTokens()).isEqualTo(1);

        // Request 2: Hợp lệ
        ConsumptionProbe probe2 = service.tryConsume(clientIp, RateLimiterService.LimitCategory.LOGIN);
        assertThat(probe2.isConsumed()).isTrue();
        assertThat(probe2.getRemainingTokens()).isEqualTo(0);

        // Request 3: Vượt quá dung lượng (hạn mức 2)
        ConsumptionProbe probe3 = service.tryConsume(clientIp, RateLimiterService.LimitCategory.LOGIN);
        assertThat(probe3.isConsumed()).isFalse();
    }

    @Test
    @DisplayName("Nên cô lập hạn mức giữa các client khác nhau (InMemory)")
    void shouldIsolateLimitsBetweenDifferentClients() {
        String ip1 = "10.0.0.1";
        String ip2 = "10.0.0.2";

        service.tryConsume(ip1, RateLimiterService.LimitCategory.LOGIN);
        service.tryConsume(ip1, RateLimiterService.LimitCategory.LOGIN);

        // ip1 hết quota
        assertThat(service.tryConsume(ip1, RateLimiterService.LimitCategory.LOGIN).isConsumed()).isFalse();

        // ip2 vẫn còn nguyên quota
        assertThat(service.tryConsume(ip2, RateLimiterService.LimitCategory.LOGIN).isConsumed()).isTrue();
    }

    @Test
    @DisplayName("Nên sử dụng Redis khi được cấu hình và hoạt động bình thường")
    void shouldUseRedisRateLimiterWhenAvailable() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        RateLimiterService redisService = new RateLimiterService(properties, redisTemplate, true);

        // Lần 1: count = 1, ttl = 60s -> còn 1 token
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString()))
                .thenReturn(List.of(1L, 60L));

        ConsumptionProbe probe1 = redisService.tryConsume("user-1", RateLimiterService.LimitCategory.LOGIN);
        assertThat(probe1.isConsumed()).isTrue();
        assertThat(probe1.getRemainingTokens()).isEqualTo(1);

        // Lần 2: count = 3 (vượt quá 2) -> bị từ chối
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString()))
                .thenReturn(List.of(3L, 45L));

        ConsumptionProbe probe2 = redisService.tryConsume("user-1", RateLimiterService.LimitCategory.LOGIN);
        assertThat(probe2.isConsumed()).isFalse();
    }

    @Test
    @DisplayName("Nên tự động Fallback về InMemory khi Redis gặp sự cố kết nối")
    void shouldFallbackToInMemoryWhenRedisFails() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString()))
                .thenThrow(new RedisConnectionFailureException("Redis connection refused"));

        RateLimiterService redisService = new RateLimiterService(properties, redisTemplate, true);

        // Request đầu tiên khi Redis chết -> Tự động fallback sang InMemory và tiêu thụ thành công
        ConsumptionProbe probe = redisService.tryConsume("fallback-client", RateLimiterService.LimitCategory.LOGIN);
        assertThat(probe.isConsumed()).isTrue();
        assertThat(probe.getRemainingTokens()).isEqualTo(1);
    }
}
