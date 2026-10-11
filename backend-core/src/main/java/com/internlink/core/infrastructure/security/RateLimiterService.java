package com.internlink.core.infrastructure.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Tạo và quản lý Token Bucket cho các client dựa trên Key và danh mục endpoint.
 */
@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RateLimitProperties properties;

    // Cache các bucket theo key (ví dụ: "login:127.0.0.1", "ai:user-uuid")
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public enum LimitCategory {
        LOGIN,
        UPLOAD,
        AI,
        DEFAULT
    }

    /**
     * Thử tiêu thụ 1 token trong bucket tương ứng.
     *
     * @param clientKey Khóa định danh client (IP hoặc ID người dùng)
     * @param category  Phân loại endpoint cần áp dụng hạn mức
     * @return ConsumptionProbe chứa kết quả (thành công hay không, thời gian cần chờ)
     */
    public ConsumptionProbe tryConsume(String clientKey, LimitCategory category) {
        String cacheKey = category.name() + ":" + clientKey;
        Bucket bucket = buckets.computeIfAbsent(cacheKey, k -> createNewBucket(category));
        return bucket.tryConsumeAndReturnRemaining(1);
    }

    private Bucket createNewBucket(LimitCategory category) {
        int capacity = switch (category) {
            case LOGIN -> properties.getLoginCapacity();
            case UPLOAD -> properties.getUploadCapacity();
            case AI -> properties.getAiCapacity();
            case DEFAULT -> properties.getDefaultCapacity();
        };

        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
