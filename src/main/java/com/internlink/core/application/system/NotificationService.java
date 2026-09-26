package com.internlink.core.application.system;

import com.internlink.core.presentation.system.dto.response.NotificationResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications(UUID recipientId);
    long countUnreadNotifications(UUID recipientId);
    NotificationResponse markAsRead(UUID id, UUID recipientId);
    void sendNotification(UUID recipientId, String type, String title, String message, String actionUrl);
}
