package com.internlink.core.application.company;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.internlink.core.application.company.impl.*;
import com.internlink.core.domain.company.Company;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;
import org.junit.jupiter.api.Test;

class PublicCompanyServiceTest {
    @Test void hidesUnverifiedProfilesAndProjectsOnlyPublicFields() throws Exception {
        var company = Company.builder().companyName("Acme").verificationStatus(VerificationStatus.PENDING)
                .verificationDetail(Map.of("note", "PRIVATE NOTE")).build();
        company.setId(UUID.randomUUID());
        var repository = mock(JpaCompanyRepository.class);
        when(repository.findById(company.getId())).thenReturn(Optional.of(company));
        var service = new PublicCompanyServiceImpl(repository, new CompanyPublicMapper());
        assertThatThrownBy(() -> service.get(company.getId())).isInstanceOf(ResourceNotFoundException.class);
        company.setVerificationStatus(VerificationStatus.VERIFIED);
        String json = new ObjectMapper().writeValueAsString(service.get(company.getId()));
        assertThat(json).contains("Acme").doesNotContain("verificationDetail", "PRIVATE NOTE", "verifiedBy");
        when(repository.findByVerificationStatus(VerificationStatus.VERIFIED)).thenReturn(List.of(company));
        assertThat(service.list()).hasSize(1);
    }
}
