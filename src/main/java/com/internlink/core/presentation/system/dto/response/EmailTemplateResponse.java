package com.internlink.core.presentation.system.dto.response;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public final class EmailTemplateResponse {
    private EmailTemplateResponse() {}

    public record Item(
            UUID id,
            String code,
            String name,
            String purpose,
            String ownerScope,
            UUID ownerId,
            String status,
            int version,
            UUID versionId,
            String subjectTemplate,
            String bodyTemplate,
            List<String> variables,
            OffsetDateTime updatedAt) {}

    public record Preview(String subject, String body, int version) {}
}
