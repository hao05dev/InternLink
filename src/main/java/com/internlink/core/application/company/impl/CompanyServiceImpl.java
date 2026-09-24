package com.internlink.core.application.company.impl;

import com.internlink.core.application.company.CompanyService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.company.dto.request.CompanyRequest;
import com.internlink.core.presentation.company.dto.response.CompanyResponse;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final JpaCompanyRepository companyRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompaniesByStatus(VerificationStatus status) {
        return companyRepository.findByVerificationStatus(status).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(UUID id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return mapToResponse(company);
    }

    @Override
    @Transactional
    public CompanyResponse registerCompany(CompanyRequest request) {
        String cleanTaxCode = request.getTaxCode().trim();
        if (companyRepository.existsByTaxCode(cleanTaxCode)) {
            throw new BadRequestException("Mã số thuế '" + cleanTaxCode + "' đã tồn tại trong hệ thống");
        }

        Company company = Company.builder()
            .companyName(request.getCompanyName().trim())
            .taxCode(cleanTaxCode)
            .industry(request.getIndustry())
            .website(request.getWebsite())
            .address(request.getAddress())
            .verificationStatus(VerificationStatus.PENDING)
            .verificationDetail(Map.of())
            .build();

        return mapToResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyResponse updateCompany(UUID id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        String cleanTaxCode = request.getTaxCode().trim();
        companyRepository.findByTaxCode(cleanTaxCode)
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(existing -> {
                throw new BadRequestException("Mã số thuế '" + cleanTaxCode + "' đã được sử dụng bởi doanh nghiệp khác");
            });

        company.setCompanyName(request.getCompanyName().trim());
        company.setTaxCode(cleanTaxCode);
        company.setIndustry(request.getIndustry());
        company.setWebsite(request.getWebsite());
        company.setAddress(request.getAddress());

        return mapToResponse(companyRepository.save(company));
    }

    @Override
    @Transactional
    public CompanyResponse verifyCompany(UUID id, VerificationStatus status, Map<String, Object> verificationDetail, UUID verifiedByUserId) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        User verifier = userRepository.findById(verifiedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", verifiedByUserId));

        company.setVerificationStatus(status);
        company.setVerificationDetail(verificationDetail != null ? verificationDetail : Map.of());
        company.setVerifiedBy(verifier);
        company.setVerifiedAt(OffsetDateTime.now());

        return mapToResponse(companyRepository.save(company));
    }

    private CompanyResponse mapToResponse(Company entity) {
        return CompanyResponse.builder()
            .id(entity.getId())
            .companyName(entity.getCompanyName())
            .taxCode(entity.getTaxCode())
            .industry(entity.getIndustry())
            .website(entity.getWebsite())
            .address(entity.getAddress())
            .verificationStatus(entity.getVerificationStatus())
            .verificationDetail(entity.getVerificationDetail())
            .verifiedByUserId(entity.getVerifiedBy() != null ? entity.getVerifiedBy().getId() : null)
            .verifiedAt(entity.getVerifiedAt())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}