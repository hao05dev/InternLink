package com.internlink.core.application.company.impl;

import com.internlink.core.application.company.PublicCompanyService;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.presentation.company.dto.response.CompanyPublicResponse;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicCompanyServiceImpl implements PublicCompanyService {
    private final JpaCompanyRepository companies;
    private final CompanyPublicMapper mapper;

    @Override
    public List<CompanyPublicResponse> list() {
        return companies.findByVerificationStatus(VerificationStatus.VERIFIED).stream()
                .map(mapper::toResponse).toList();
    }

    @Override
    public CompanyPublicResponse get(UUID id) {
        return companies.findById(id).filter(c -> c.getVerificationStatus() == VerificationStatus.VERIFIED)
                .map(mapper::toResponse).orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
    }
}
