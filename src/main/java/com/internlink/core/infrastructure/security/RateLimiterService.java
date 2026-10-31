package com.internlink.core.infrastructure.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Tạo và quản lý Token Bucket / Rate Limiter cho các client.
 * 
 * Hỗ trợ 2 chế độ:
 * 1. Redis Distributed Rate Limiting (ưu tiên) với cửa sổ trượt và atomic script.
 * 2. In-Memory Token Bucket (Fallback) khi Redis chưa bật hoặc gặp sự cố, đảm bảo ứng dụng không bao giờ bị gián đoạn.
 */
@Slf4j
@Service
public class RateLimiterService {

    private final RateLimitProperties properties;
    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;

    // Cache các bucket in-memory làm phương án dự phòng (fallback)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private long lastCleanup = System.nanoTime();

    private static final RedisScript<List> RATE_LIMIT_SCRIPT = new DefaultRedisScript<>(
            """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[1])
            end
            local ttl = redis.call('TTL', KEYS[1])
            return {current, ttl}
            """,
            List.class
    );

    public enum LimitCategory {
        LOGIN,
        RECOVERY,
        UPLOAD,
        AI,
        DEFAULT
    }

    public RateLimiterService(RateLimitProperties properties) {
        this(properties, null, false);
    }

    @Autowired
    public RateLimiterService(
            RateLimitProperties properties,
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            @Value("${internlink.redis.enabled:true}") boolean redisEnabled) {
        this.properties = properties;
        this.redisTemplate = redisTemplate;
        this.redisEnabled = redisEnabled;
    }

    /**
     * Thử tiêu thụ 1 lượt trong hạn mức cho phép.
     *
     * @param clientKey Khóa định danh client (IP hoặc ID người dùng)
     * @param category  Phân loại endpoint cần áp dụng hạn mức
     * @return ConsumptionProbe chứa kết quả (thành công hay không, số lượt còn lại, thời gian cần chờ)
     */
    public ConsumptionProbe tryConsume(String clientKey, LimitCategory category) {
        if (redisEnabled && redisTemplate != null) {
            try {
                return tryConsumeRedis(clientKey, category);
            } catch (Exception ex) {
                log.warn("Không thể kết nối đến Redis cho RateLimiter (sẽ dùng InMemory dự phòng): {}", ex.getMessage());
            }
        }
        return tryConsumeInMemory(clientKey, category);
    }

    private ConsumptionProbe tryConsumeRedis(String clientKey, LimitCategory category) {
        int capacity = resolveCapacity(category);
        int windowSeconds = 60; // 1 phút
        String redisKey = "rate:limit:" + category.name().toLowerCase() + ":" + clientKey;

        List<?> result = redisTemplate.execute(
                RATE_LIMIT_SCRIPT,
                Collections.singletonList(redisKey),
                String.valueOf(windowSeconds)
        );

        if (result == null || result.size() < 2) {
            return tryConsumeInMemory(clientKey, category);
        }

        long currentCount = ((Number) result.get(0)).longValue();
        long ttlSeconds = ((Number) result.get(1)).longValue();

        if (currentCount <= capacity) {
            long remaining = capacity - currentCount;
            return ConsumptionProbe.consumed(remaining, 0L);
        } else {
            long waitNanos = Math.max(1L, ttlSeconds) * 1_000_000_000L;
            return ConsumptionProbe.rejected(0L, waitNanos, waitNanos);
        }
    }

    private synchronized ConsumptionProbe tryConsumeInMemory(String clientKey, LimitCategory category) {
        long now = System.nanoTime();
        if (now - lastCleanup > Duration.ofMinutes(10).toNanos()) {
            buckets.clear();
            lastCleanup = now;
        }
        if (buckets.size() >= 10000) clientKey = "overflow";
        String cacheKey = category.name() + ":" + clientKey;
        Bucket bucket = buckets.computeIfAbsent(cacheKey, k -> createNewBucket(category));
        return bucket.tryConsumeAndReturnRemaining(1);
    }

    private int resolveCapacity(LimitCategory category) {
        return switch (category) {
            case LOGIN -> properties.getLoginCapacity();
            case RECOVERY -> properties.getRecoveryCapacity();
            case UPLOAD -> properties.getUploadCapacity();
            case AI -> properties.getAiCapacity();
            case DEFAULT -> properties.getDefaultCapacity();
        };
    }

    private Bucket createNewBucket(LimitCategory category) {
        int capacity = resolveCapacity(category);

        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
