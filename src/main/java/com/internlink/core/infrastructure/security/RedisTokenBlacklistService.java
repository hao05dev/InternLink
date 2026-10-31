package com.internlink.core.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * Quản lý danh sách Token bị thu hồi (Blacklist) sử dụng Redis với TTL tự động hết hạn.
 * 
 * Tích hợp cơ chế Graceful Fallback:
 * - Khi Redis hoạt động bình thường -> Lưu và kiểm tra trên Redis.
 * - Khi Redis bị tắt, lỗi kết nối hoặc chưa bật Docker -> Tự động chuyển hướng về InMemoryTokenBlacklistService,
 *   bảo đảm ứng dụng luôn chạy ổn định và không bị gián đoạn khi demo.
 */
@Slf4j
@Primary
@Service
public class RedisTokenBlacklistService implements TokenRevocationService {

    private static final String BLACKLIST_KEY_PREFIX = "auth:blacklist:";
    private final StringRedisTemplate redisTemplate;
    private final InMemoryTokenBlacklistService fallbackService;
    private final boolean redisEnabled;

    public RedisTokenBlacklistService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            InMemoryTokenBlacklistService fallbackService,
            @Value("${internlink.redis.enabled:true}") boolean redisEnabled) {
        this.redisTemplate = redisTemplate;
        this.fallbackService = fallbackService;
        this.redisEnabled = redisEnabled;
    }

    @Override
    public void revokeToken(String jti, Date expiryDate) {
        if (jti == null || jti.isBlank()) {
            return;
        }

        // Nếu Redis bị tắt cấu hình hoặc bean redisTemplate không tồn tại -> Dùng InMemory
        if (!redisEnabled || redisTemplate == null) {
            fallbackService.revokeToken(jti, expiryDate);
            return;
        }

        try {
            long now = System.currentTimeMillis();
            long expiryMillis = expiryDate != null ? expiryDate.getTime() : now + 86400000L;
            long ttlSeconds = Math.max(1L, (expiryMillis - now) / 1000L);

            String key = BLACKLIST_KEY_PREFIX + jti;
            redisTemplate.opsForValue().set(key, "revoked", ttlSeconds, TimeUnit.SECONDS);
            log.info("Token JTI [{}] đã được đưa vào Redis Blacklist với TTL = {} giây", jti, ttlSeconds);
        } catch (Exception ex) {
            log.warn("Không thể kết nối đến Redis khi thu hồi token (sẽ dùng InMemory dự phòng): {}", ex.getMessage());
            fallbackService.revokeToken(jti, expiryDate);
        }
    }

    @Override
    public boolean isRevoked(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }

        if (!redisEnabled || redisTemplate == null) {
            return fallbackService.isRevoked(jti);
        }

        try {
            String key = BLACKLIST_KEY_PREFIX + jti;
            Boolean hasKey = redisTemplate.hasKey(key);
            if (Boolean.TRUE.equals(hasKey)) {
                return true;
            }
            // Kiểm tra thêm trong bộ nhớ fallback phòng trường hợp token được revoke lúc Redis tạm mất kết nối
            return fallbackService.isRevoked(jti);
        } catch (Exception ex) {
            log.warn("Không thể kết nối đến Redis khi kiểm tra token (sẽ dùng InMemory dự phòng): {}", ex.getMessage());
            return fallbackService.isRevoked(jti);
        }
    }
}
