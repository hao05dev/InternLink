package com.internlink.core.application.system;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Ngăn chặn tăng lượt xem trùng lặp từ cùng một người dùng
 * trong khoảng thời gian cửa sổ 24 giờ (Unique Views Guard).
 */
@Service
public class PostViewGuardService {

    private static final Duration VIEW_COOLDOWN = Duration.ofHours(24);
    private static final int MAX_CACHE_ENTRIES = 20_000;

    // Cache key format: "postId:identityKey" -> Timestamp of recorded view
    private final Map<String, Instant> recentViewsCache = new ConcurrentHashMap<>();

    /**
     * Kiểm tra xem lượt xem từ danh tính này có hợp lệ để tính view hay không.
     * Nếu hợp lệ, tự động ghi nhận vào cache và trả về true.
     *
     * @param postId ID bài viết
     * @param identityKey Chuỗi định danh duy nhất (User ID, hoặc VisitorId + IP Hash)
     * @return true nếu là lượt xem hợp lệ mới trong 24 giờ; false nếu là trùng lặp
     */
    public boolean recordViewIfEligible(UUID postId, String identityKey) {
        if (postId == null || identityKey == null || identityKey.isBlank()) {
            return false;
        }

        String cacheKey = postId + ":" + identityKey.trim();
        Instant now = Instant.now();

        // Kiểm tra xem lượt xem trước đó còn trong thời hạn 24 giờ hay không
        Instant lastViewed = recentViewsCache.get(cacheKey);
        if (lastViewed != null && Duration.between(lastViewed, now).compareTo(VIEW_COOLDOWN) < 0) {
            return false;
        }

        // Dọn dẹp cache nếu kích thước vượt ngưỡng
        if (recentViewsCache.size() > MAX_CACHE_ENTRIES) {
            cleanExpiredEntries(now);
        }

        recentViewsCache.put(cacheKey, now);
        return true;
    }

    private void cleanExpiredEntries(Instant now) {
        recentViewsCache.entrySet().removeIf(entry ->
            Duration.between(entry.getValue(), now).compareTo(VIEW_COOLDOWN) >= 0
        );
    }
}
