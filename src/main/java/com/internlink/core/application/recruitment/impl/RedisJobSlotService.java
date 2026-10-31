package com.internlink.core.application.recruitment.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Quản lý số lượng chỉ tiêu tuyển dụng (Vacancy Slots) trên Redis để đánh chặn
 * các yêu cầu tranh chấp đồng thời (High Concurrency / Race Condition) với tốc độ micro-giây.
 * 
 * Tích hợp cơ chế 2 lớp:
 * 1. Đánh chặn sớm trên RAM bằng Redis Atomic Decrement (DECR) / Lua script.
 * 2. Bảo đảm ACID tuyệt đối với Pessimistic Lock (SELECT FOR UPDATE) dưới PostgreSQL.
 * 3. Graceful Fallback: Nếu Redis bị tắt, tự động nhường toàn quyền cho PostgreSQL xử lý.
 */
@Slf4j
@Service
public class RedisJobSlotService {

    private static final String KEY_PREFIX = "job:slots:";
    private final StringRedisTemplate redisTemplate;
    private final boolean redisEnabled;

    // ARGV[1] là số chỗ còn lại do DB tính dưới khóa PESSIMISTIC_WRITE, nên luôn là giá trị chuẩn.
    // Ghi đè bộ đếm bằng giá trị này thay vì tin vào số cũ trên Redis: offer hết hạn, bị tự động
    // từ chối hoặc giao dịch rollback sẽ không làm bộ đếm lệch và từ chối nhầm.
    private static final RedisScript<Long> ACQUIRE_SLOT_SCRIPT = new DefaultRedisScript<>(
            """
            local remaining = tonumber(ARGV[1])
            if remaining <= 0 then
                redis.call('SET', KEYS[1], 0, 'EX', 86400)
                return 0
            end
            redis.call('SET', KEYS[1], remaining - 1, 'EX', 86400)
            return 1
            """,
            Long.class
    );

    // Không tạo khóa mới khi khóa đã hết hạn: lần giữ chỗ sau sẽ lấy lại số chuẩn từ DB.
    private static final RedisScript<Long> RELEASE_SLOT_SCRIPT = new DefaultRedisScript<>(
            """
            if redis.call('EXISTS', KEYS[1]) == 0 then
                return 0
            end
            redis.call('INCR', KEYS[1])
            redis.call('EXPIRE', KEYS[1], 86400)
            return 1
            """,
            Long.class
    );

    public RedisJobSlotService(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            @Value("${internlink.redis.enabled:true}") boolean redisEnabled) {
        this.redisTemplate = redisTemplate;
        this.redisEnabled = redisEnabled;
    }

    /**
     * Thử chiếm 1 slot chỉ tiêu tuyển dụng một cách nguyên tử (Atomic).
     *
     * @param jobId              Mã định danh vị trí tuyển dụng
     * @param availableVacancies Số lượng vị trí còn trống hiện tại tính từ DB
     * @return true nếu chiếm slot thành công; false nếu đã hết chỉ tiêu
     */
    public boolean tryAcquireSlot(UUID jobId, long availableVacancies) {
        if (!redisEnabled || redisTemplate == null) {
            return true; // Fallback: Cho phép DB pessimistic lock kiểm tra tiếp
        }

        try {
            String key = KEY_PREFIX + jobId;
            Long result = redisTemplate.execute(
                    ACQUIRE_SLOT_SCRIPT,
                    Collections.singletonList(key),
                    String.valueOf(availableVacancies)
            );
            boolean acquired = result != null && result == 1L;
            if (!acquired) {
                log.info("Redis phát hiện vị trí [{}] đã hết slot trống (Atomic Rejection).", jobId);
            }
            return acquired;
        } catch (Exception ex) {
            log.warn("Lỗi kết nối Redis khi kiểm tra slot tuyển dụng (Fallback về DB Lock): {}", ex.getMessage());
            return true;
        }
    }

    /**
     * Hoàn trả 1 slot tuyển dụng khi sinh viên từ chối Offer hoặc Offer hết hạn.
     */
    public void releaseSlot(UUID jobId) {
        if (!redisEnabled || redisTemplate == null) {
            return;
        }

        try {
            redisTemplate.execute(RELEASE_SLOT_SCRIPT, Collections.singletonList(KEY_PREFIX + jobId));
            log.debug("Đã hoàn trả 1 slot tuyển dụng cho vị trí [{}] trên Redis.", jobId);
        } catch (Exception ex) {
            log.warn("Không thể hoàn trả slot trên Redis: {}", ex.getMessage());
        }
    }

    /**
     * Đồng bộ số slot còn lại từ DB sang Redis.
     */
    public void syncRemainingSlots(UUID jobId, long remainingSlots) {
        if (!redisEnabled || redisTemplate == null) {
            return;
        }

        try {
            String key = KEY_PREFIX + jobId;
            redisTemplate.opsForValue().set(key, String.valueOf(Math.max(0L, remainingSlots)), 1, TimeUnit.DAYS);
        } catch (Exception ex) {
            log.warn("Không thể đồng bộ slot sang Redis: {}", ex.getMessage());
        }
    }
}
