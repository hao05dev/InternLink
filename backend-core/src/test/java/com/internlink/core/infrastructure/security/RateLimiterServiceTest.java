package com.internlink.core.infrastructure.security;

import io.github.bucket4j.ConsumptionProbe;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimiterServiceTest {

    private RateLimiterService service;

    @BeforeEach
    void setUp() {
        RateLimitProperties properties = new RateLimitProperties();
        properties.setLoginCapacity(2);
        properties.setUploadCapacity(5);
        properties.setAiCapacity(5);
        properties.setDefaultCapacity(10);
        service = new RateLimiterService(properties);
    }

    @Test
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
}
