package com.internlink.core.application.system.notification;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReminderCandidate(
        String key,
        UUID recipientId,
        String type,
        String title,
        String path,
        OffsetDateTime dueAt) {}
