package com.internlink.core.presentation.system.dto.response;

import java.time.OffsetDateTime;
import java.util.*;

public final class NotificationCampaignResponse {
    private NotificationCampaignResponse() {}

    public record Recipient(
            UUID id,
            UUID userId,
            String email,
            String displayName,
            String studentCode,
            String status,
            String errorCode,
            String emailStatus) {}

    public record Preview(int total, int withAccount, int emailEligible, List<Recipient> sample) {}

    public record Item(
            UUID id,
            UUID termId,
            UUID createdBy,
            String subject,
            String purpose,
            String channel,
            String status,
            OffsetDateTime createdAt,
            Map<String, Long> counts) {}

    public record Page(List<Item> items, long totalElements, int totalPages) {}

    public record Detail(
            Item campaign, List<Recipient> recipients, long totalRecipients, int totalPages) {}
}
