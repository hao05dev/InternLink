package com.internlink.core.application.system.upload;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.security.SecurityGuard;
import org.junit.jupiter.api.Test;
import java.util.UUID;

class CompanyMediaAccessPolicyTest {
    private final JpaCompanyRepository companies = mock(JpaCompanyRepository.class);
    private final MediaAssetRepository assets = mock(MediaAssetRepository.class);
    private final MediaAccessPolicy policy = new MediaAccessPolicy(mock(SecurityGuard.class),
            mock(JpaUserRepository.class), companies, mock(JpaInternshipPlacementRepository.class),
            mock(JpaPortfolioFormRepository.class), assets);

    @Test
    void companyRepresentativeCanOnlyUploadForOwnCompany() {
        var company = new Company();
        company.setId(UUID.randomUUID());
        var rep = User.builder().role(UserRole.COMPANY_REP).company(company).build();
        var other = UUID.randomUUID();
        when(companies.existsById(company.getId())).thenReturn(true);
        when(companies.existsById(other)).thenReturn(true);
        assertThat(policy.requireUpload(rep, MediaPurpose.COMPANY_LOGO, company.getId(), null))
                .isEqualTo(company.getId());
        assertThatThrownBy(() -> policy.requireUpload(rep, MediaPurpose.COMPANY_COVER, other, null))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void previewIsPrivateUntilTheAssetHasAPublicCompanyReference() {
        var company = new Company();
        company.setId(UUID.randomUUID());
        var rep = User.builder().role(UserRole.COMPANY_REP).company(company).build();
        rep.setId(UUID.randomUUID());
        var stranger = User.builder().role(UserRole.COMPANY_REP).build();
        stranger.setId(UUID.randomUUID());
        var asset = new MediaAssetRepository.Asset(UUID.randomUUID(), rep.getId(),
                MediaPurpose.COMPANY_LOGO, company.getId(), null, "key", "logo.png", "image/png", 10, "sum");
        assertThat(policy.canRead(rep, asset)).isTrue();
        assertThat(policy.canRead(stranger, asset)).isFalse();
        assertThat(policy.canRead(null, asset)).isFalse();
        when(assets.publicReference(asset)).thenReturn(true);
        assertThat(policy.canRead(null, asset)).isTrue();
    }
}
