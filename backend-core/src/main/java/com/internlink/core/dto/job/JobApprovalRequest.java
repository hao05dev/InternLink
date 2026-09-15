package com.internlink.core.dto.job;

import jakarta.validation.constraints.NotBlank;

public record JobApprovalRequest(
        @NotBlank(message = "Status is required (APPROVED or REJECTED)") String status,

        String feedback) {
}