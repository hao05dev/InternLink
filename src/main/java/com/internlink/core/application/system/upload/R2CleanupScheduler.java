package com.internlink.core.application.system.upload;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "internlink.storage.r2.cleanup-enabled", havingValue = "true")
public class R2CleanupScheduler {
    private final R2MaintenanceService service;

    @Scheduled(fixedDelayString = "${internlink.storage.r2.cleanup-delay-ms:3600000}")
    public void run() {
        service.cleanupExpired();
    }
}
