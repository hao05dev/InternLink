package com.internlink.core.application.company;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.internlink.core.application.company.impl.CompanyMapper;
import com.internlink.core.application.company.impl.CompanyServiceImpl;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.company.dto.request.CompanyRequest;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.security.SecurityGuard;

@ExtendWith(MockitoExtension.class)
class CompanyRegistrationTest {

    @Mock
    private JpaCompanyRepository companyRepository;

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private SecurityGuard securityGuard;

    @Mock
    private NotificationService notificationService;

    @Test
    void companyRegistrationRejectsExistingTaxCode() {
        CompanyServiceImpl service =
                new CompanyServiceImpl(
                        companyRepository,
                        userRepository,
                        auditLogService,
                        securityGuard,
                        new CompanyMapper(),
                        new CompanyAccessPolicy(securityGuard, userRepository),
                        notificationService);
        when(companyRepository.existsByTaxCode("123")).thenReturn(true);
        CompanyRequest request =
                CompanyRequest.builder()
                        .companyName("Acme")
                        .taxCode("123")
                        .address(Map.of("city", "Can Tho"))
                        .build();

        assertThatThrownBy(() -> service.registerCompany(request))
                .isInstanceOf(BadRequestException.class);
    }
}
