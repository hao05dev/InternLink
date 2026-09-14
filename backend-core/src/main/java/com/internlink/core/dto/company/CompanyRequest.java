package com.internlink.core.dto.company;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(
        @NotBlank(message = "Company name is required") String name,

        String taxCode,
        String industry,
        String website,
        String addressRaw,
        String contactName,
        String contactEmail,
        String contactPhone,
        String description,
        String workEnvironmentInfo) {
}