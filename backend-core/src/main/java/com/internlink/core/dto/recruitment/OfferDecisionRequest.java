package com.internlink.core.dto.recruitment;

import jakarta.validation.constraints.NotBlank;

public record OfferDecisionRequest(
        @NotBlank(message = "Decision is required (ACCEPTED or REJECTED)") String decision // "ACCEPTED" or "REJECTED"
) {
}