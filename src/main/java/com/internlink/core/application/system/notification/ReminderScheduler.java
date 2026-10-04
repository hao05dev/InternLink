package com.internlink.core.application.system.notification;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "notifications.reminders-enabled", havingValue = "true")
public class ReminderScheduler {
    private final NotificationReminderService service;

    @Scheduled(cron = "${notifications.reminder-cron:0 */15 * * * *}", zone = "Asia/Ho_Chi_Minh")
    public void tick() {
        service.run(OffsetDateTime.now());
    }
}
