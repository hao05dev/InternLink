package com.internlink.core.dto.company;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record VerifyCompanyRequest(
        @NotBlank(message = "Status is required (VERIFIED or REJECTED)") String status,

        String reviewNotes,
        Map<String, Object> checklistPassed) {
}