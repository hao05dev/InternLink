package com.internlink.core.dto.tracking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record LogbookReviewRequest(
        @NotBlank(message = "Status is required (APPROVED, REJECTED, REVISION_REQUESTED)") String status,

        String feedback,

        @Min(1) @Max(5) Integer rating) {
}