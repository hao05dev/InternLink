package com.internlink.core.dto.company;

import com.internlink.core.entity.Company;

public record CompanyResponse(
        Long id,
        String name,
        String taxCode,
        String industry,
        String website,
        String addressRaw,
        String contactName,
        String contactEmail,
        String contactPhone,
        String description,
        String workEnvironmentInfo,
        String mouStatus,
        String verificationStatus) {
    public static CompanyResponse fromEntity(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getTaxCode(),
                company.getIndustry(),
                company.getWebsite(),
                company.getAddressRaw(),
                company.getContactName(),
                company.getContactEmail(),
                company.getContactPhone(),
                company.getDescription(),
                company.getWorkEnvironmentInfo(),
                company.getMouStatus(),
                company.getVerificationStatus());
    }
}