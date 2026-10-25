package com.internlink.core.application.system.notification;

import java.util.UUID;

public record EmailDeliveryFilter(
        String status, String scopeType, String sourceType, UUID templateVersionId, String recipient) {}
