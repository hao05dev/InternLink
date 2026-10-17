package com.internlink.core.presentation.company.dto.response;

import com.internlink.core.shared.enums.VerificationStatus;
import java.util.UUID;

/** Explicit public projection: never includes verification notes or reviewer identity. */
public record CompanyPublicResponse(
        UUID id, String companyName, String description, String industry,
        String employeeRange, String website, String logoUrl, String coverImageUrl,
        String officeAddress, String mapEmbedUrl, String mapsUrl,
        VerificationStatus verificationStatus) {}
