package com.internlink.core.service;

import com.internlink.core.dto.company.CompanyRequest;
import com.internlink.core.dto.company.CompanyResponse;
import com.internlink.core.dto.company.VerifyCompanyRequest;
import com.internlink.core.entity.Company;
import com.internlink.core.entity.CompanyVerification;
import com.internlink.core.repository.CompanyRepository;
import com.internlink.core.repository.CompanyVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyVerificationRepository verificationRepository;

    // 1. HR đăng ký hoặc cập nhật hồ sơ công ty
    @Transactional
    public CompanyResponse saveOrUpdateProfile(Long userId, CompanyRequest request) {
        Company company = companyRepository.findByCreatedByUserId(userId)
                .orElse(Company.builder().createdByUserId(userId).build());

        company.setName(request.name());
        company.setTaxCode(request.taxCode());
        company.setIndustry(request.industry());
        company.setWebsite(request.website());
        company.setAddressRaw(request.addressRaw());
        company.setContactName(request.contactName());
        company.setContactEmail(request.contactEmail());
        company.setContactPhone(request.contactPhone());
        company.setDescription(request.description());
        company.setWorkEnvironmentInfo(request.workEnvironmentInfo());

        return CompanyResponse.fromEntity(companyRepository.save(company));
    }

    // 2. Lấy hồ sơ công ty của chính HR đang đăng nhập
    @Transactional(readOnly = true)
    public CompanyResponse getMyCompanyProfile(Long userId) {
        Company company = companyRepository.findByCreatedByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Company profile not found for user ID: " + userId));
        return CompanyResponse.fromEntity(company);
    }

    // 3. Public: Lấy danh sách các công ty đã được Khoa phê duyệt (VERIFIED)
    @Transactional(readOnly = true)
    public List<CompanyResponse> getVerifiedCompanies() {
        return companyRepository.findByVerificationStatus("VERIFIED").stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    // 4. Khoa: Lấy danh sách các công ty đang chờ duyệt
    @Transactional(readOnly = true)
    public List<CompanyResponse> getPendingCompanies() {
        return companyRepository.findByVerificationStatus("PENDING").stream()
                .map(CompanyResponse::fromEntity)
                .toList();
    }

    // 5. Khoa: Thẩm định & Phê duyệt doanh nghiệp
    @Transactional
    public CompanyResponse verifyCompany(Long companyId, Long facultyUserId, VerifyCompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with ID: " + companyId));

        company.setVerificationStatus(request.status().toUpperCase());
        companyRepository.save(company);

        CompanyVerification verification = CompanyVerification.builder()
                .companyId(companyId)
                .reviewedByFacultyId(facultyUserId)
                .status(request.status().toUpperCase())
                .reviewNotes(request.reviewNotes())
                .checklistPassed(request.checklistPassed())
                .build();

        verificationRepository.save(verification);

        return CompanyResponse.fromEntity(company);
    }
}