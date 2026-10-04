package com.internlink.core.presentation.system.dto.response;

import java.util.List;

public record NotificationPageResponse(
        List<NotificationResponse> items, long totalElements, int totalPages, long unreadCount) {}
