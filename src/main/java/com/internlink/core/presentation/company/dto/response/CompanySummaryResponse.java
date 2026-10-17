package com.internlink.core.presentation.company.dto.response;

import java.util.UUID;

public record CompanySummaryResponse(
        UUID id, String companyName, String logoUrl, String industry,
        String employeeRange, String website, String officeAddress, boolean publicProfile) {}
