package com.internlink.core.presentation.company.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompanyProfileRequest {
    @Size(max = 30000) private String description;
    @Size(max = 100) private String industry;
    @Size(max = 100) private String employeeRange;
    @Size(max = 255) private String website;
    @Size(max = 2048) private String logoUrl;
    @Size(max = 2048) private String coverImageUrl;
    @Size(max = 1000) private String officeAddress;
    @Size(max = 8192) private String mapEmbedUrl;
    @Size(max = 8192) private String mapsUrl;
}
