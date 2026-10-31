package com.internlink.core.application.recruitment.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisJobSlotServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RedisJobSlotService slotService;
    private final UUID testJobId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        slotService = new RedisJobSlotService(redisTemplate, true);
    }

    @Test
    @DisplayName("Nên chiếm slot thành công khi Redis script trả về 1 (Còn chỗ)")
    void shouldAcquireSlotSuccessfullyWhenRedisReturnsOne() {
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString()))
                .thenReturn(1L);

        boolean acquired = slotService.tryAcquireSlot(testJobId, 3);

        assertThat(acquired).isTrue();
    }

    @Test
    @DisplayName("Nên từ chối chiếm slot khi Redis script trả về 0 (Đã hết chỉ tiêu)")
    void shouldRejectSlotWhenRedisReturnsZero() {
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString()))
                .thenReturn(0L);

        boolean acquired = slotService.tryAcquireSlot(testJobId, 0);

        assertThat(acquired).isFalse();
    }

    @Test
    @DisplayName("Nên tự động Fallback về true (để DB Lock kiểm tra) khi Redis gặp sự cố kết nối")
    void shouldFallbackToTrueWhenRedisConnectionFails() {
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString()))
                .thenThrow(new RedisConnectionFailureException("Redis is down"));

        boolean acquired = slotService.tryAcquireSlot(testJobId, 2);

        // Fallback an toàn: Cho phép tiếp tục để DB Pessimistic Lock kiểm tra
        assertThat(acquired).isTrue();
    }

    @Test
    @DisplayName("Nên hoàn trả slot trên Redis khi sinh viên từ chối offer")
    void shouldReleaseSlotSuccessfully() {
        slotService.releaseSlot(testJobId);

        // Dùng script để không tạo khóa mới khi khóa đã hết hạn (INCR trên khóa trống sẽ tạo bộ đếm sai)
        verify(redisTemplate).execute(any(RedisScript.class), eq(List.of("job:slots:" + testJobId)));
        verify(valueOperations, never()).increment(anyString());
    }

    @Test
    @DisplayName("Nên đồng bộ số slot còn lại từ DB sang Redis")
    void shouldSyncRemainingSlotsSuccessfully() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        slotService.syncRemainingSlots(testJobId, 5);

        verify(valueOperations).set("job:slots:" + testJobId, "5", 1L, TimeUnit.DAYS);
    }
}
