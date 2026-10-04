package com.internlink.core.application.system.notification;

import com.internlink.core.infrastructure.persistence.jdbc.NotificationCampaignRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "notifications.campaigns-enabled", havingValue = "true")
public class NotificationCampaignScheduler {
    private final NotificationCampaignRepository repository;
    private final NotificationCampaignDeliveryService delivery;

    @Scheduled(fixedDelayString = "${notifications.campaign-delay-ms:10000}")
    public void run() {
        repository.recover();
        for (int i = 0; i < 25; i++) {
            var row = repository.claim();
            if (row == null) break;
            delivery.process(row);
        }
    }
}
