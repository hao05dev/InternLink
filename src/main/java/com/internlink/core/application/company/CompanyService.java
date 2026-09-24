package com.internlink.core.application.company;

import com.internlink.core.presentation.company.dto.request.CompanyRequest;
import com.internlink.core.presentation.company.dto.response.CompanyResponse;
import com.internlink.core.shared.enums.VerificationStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CompanyService {
    List<CompanyResponse> getAllCompanies();
    List<CompanyResponse> getCompaniesByStatus(VerificationStatus status);
    CompanyResponse getCompanyById(UUID id);
    CompanyResponse registerCompany(CompanyRequest request);
    CompanyResponse updateCompany(UUID id, CompanyRequest request);
    CompanyResponse verifyCompany(UUID id, VerificationStatus status, Map<String, Object> verificationDetail, UUID verifiedByUserId);
}