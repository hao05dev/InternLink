package com.internlink.core.presentation.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private UUID recipientUserId;
    private String notificationType;
    private String title;
    private String message;
    private String actionUrl;
    private Boolean isRead;
    private OffsetDateTime readAt;
    private OffsetDateTime createdAt;
}