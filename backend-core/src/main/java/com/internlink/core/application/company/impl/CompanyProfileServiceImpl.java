package com.internlink.core.application.company.impl;

import com.internlink.core.application.company.CompanyProfileService;
import com.internlink.core.application.company.CompanyAccessPolicy;
import com.internlink.core.application.system.upload.MediaReferencePolicy;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.presentation.company.dto.request.CompanyProfileRequest;
import com.internlink.core.presentation.company.dto.response.CompanyPublicResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyProfileServiceImpl implements CompanyProfileService {
    private final CompanyAccessPolicy access;
    private final JpaCompanyRepository companies;
    private final CompanyProfileMapper mapper;
    private final CompanyPublicMapper publicMapper;
    private final MediaReferencePolicy media;

    @Override
    @Transactional(readOnly = true)
    public CompanyPublicResponse getOwnProfile() {
        return publicMapper.toResponse(access.ownCompany());
    }

    @Override
    @Transactional
    public CompanyPublicResponse updateOwnProfile(CompanyProfileRequest request) {
        var company = access.ownCompany();
        media.company(company.getId(), request.getLogoUrl(), request.getCoverImageUrl());
        mapper.apply(company, request);
        return publicMapper.toResponse(companies.save(company));
    }
}
