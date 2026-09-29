package com.internlink.core.application.system.impl;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Notification;
import com.internlink.core.infrastructure.persistence.jpa.JpaNotificationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.system.dto.response.NotificationResponse;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final JpaNotificationRepository notificationRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UUID recipientId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadNotifications(UUID recipientId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID id, UUID recipientId) {
        Notification notification = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!notification.getRecipient().getId().equals(recipientId)) {
            throw new ForbiddenException("Bạn không có quyền cập nhật thông báo này");
        }

        notification.setIsRead(true);
        notification.setReadAt(OffsetDateTime.now());

        return mapToResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID recipientId) {
        notificationRepository.markAllAsRead(recipientId);
    }

    @Override
    @Transactional
    public void sendNotification(UUID recipientId, String type, String title, String message, String actionUrl) {
        User recipient = userRepository.findById(recipientId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", recipientId));

        Notification notification = Notification.builder()
            .recipient(recipient)
            .notificationType(type)
            .title(title)
            .message(message)
            .actionUrl(actionUrl)
            .isRead(false)
            .build();

        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification entity) {
        return NotificationResponse.builder()
            .id(entity.getId())
            .recipientUserId(entity.getRecipient().getId())
            .notificationType(entity.getNotificationType())
            .title(entity.getTitle())
            .message(entity.getMessage())
            .actionUrl(entity.getActionUrl())
            .isRead(entity.getIsRead())
            .readAt(entity.getReadAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
