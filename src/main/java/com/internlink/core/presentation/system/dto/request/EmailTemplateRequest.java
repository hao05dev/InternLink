package com.internlink.core.presentation.system.dto.request;

import jakarta.validation.constraints.*;
import java.util.Map;
import java.util.UUID;

public final class EmailTemplateRequest {
    private EmailTemplateRequest() {}

    public record Save(
            @NotBlank @Size(max = 80) String code,
            @NotBlank @Size(max = 150) String name,
            @NotBlank @Size(max = 40) String purpose,
            @Size(max = 20) String ownerScope,
            UUID ownerId,
            @NotBlank @Size(max = 255) String subjectTemplate,
            @NotBlank @Size(max = 20000) String bodyTemplate) {}

    public record Preview(@NotNull UUID templateId, @NotNull Map<String, String> variables) {}
}
