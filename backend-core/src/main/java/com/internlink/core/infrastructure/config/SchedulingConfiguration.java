package com.internlink.core.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Kích hoạt cơ chế lập lịch tác vụ nền (@Scheduled) trong toàn bộ ứng dụng.
 * 
 * Các worker/scheduler đang sử dụng:
 * - EmailOutboxWorker: Quét và gửi email trong hàng đợi
 * - ReminderScheduler: Gửi thông báo nhắc nhở hạn chót theo cron
 * - NotificationCampaignScheduler: Điều phối gửi broadcast notifications
 * - R2CleanupScheduler: Dọn dẹp tài nguyên rác trên cloud storage
 * - NotificationStreamHub: Gửi SSE ping/heartbeat duy trì kết nối
 * - InMemoryTokenBlacklistService: Dọn dẹp token JWT hết hạn
 */
@Configuration
@EnableScheduling
public class SchedulingConfiguration {
}
