package com.internlink.core.application.company.impl;

import com.internlink.core.domain.company.Company;
import com.internlink.core.presentation.company.dto.response.CompanyPublicResponse;
import com.internlink.core.presentation.company.dto.response.CompanySummaryResponse;
import com.internlink.core.shared.enums.VerificationStatus;
import org.springframework.stereotype.Component;

@Component
public class CompanyPublicMapper {
    public CompanyPublicResponse toResponse(Company company) {
        return new CompanyPublicResponse(company.getId(), company.getCompanyName(), company.getDescription(),
                company.getIndustry(), company.getEmployeeRange(), company.getWebsite(), company.getLogoUrl(),
                company.getCoverImageUrl(), company.getOfficeAddress(), company.getMapEmbedUrl(),
                company.getMapsUrl(), company.getVerificationStatus());
    }

    public CompanySummaryResponse summary(Company company) {
        boolean visible = company.getVerificationStatus() == VerificationStatus.VERIFIED;
        return new CompanySummaryResponse(company.getId(), company.getCompanyName(),
                visible ? company.getLogoUrl() : null, visible ? company.getIndustry() : null,
                visible ? company.getEmployeeRange() : null, visible ? company.getWebsite() : null,
                visible ? company.getOfficeAddress() : null, visible);
    }
}
