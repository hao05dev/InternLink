package com.internlink.core.dto.recruitment;

import jakarta.validation.constraints.NotNull;

public record ApplyJobRequest(
        @NotNull(message = "Job ID is required") Long jobId,

        String coverLetter) {
}