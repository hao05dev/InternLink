package com.internlink.core.presentation.system.dto.request;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record ProviderEmailEventRequest(
        UUID outboxId,
        String providerMessageId,
        String eventType,
        OffsetDateTime occurredAt,
        String errorCode,
        Map<String, Object> metadata) {}
