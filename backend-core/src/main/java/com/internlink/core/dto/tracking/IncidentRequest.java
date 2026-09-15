package com.internlink.core.dto.tracking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IncidentRequest(
        @NotNull(message = "Agreement ID is required") Long learningAgreementId,

        @NotBlank(message = "Incident type is required") String incidentType,

        @NotBlank(message = "Description is required") String description,

        String studentEvidenceUrl,
        String severity) {
}