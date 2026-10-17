package com.internlink.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.internlink.core.application.auth.impl.AuthServiceImpl;
import com.internlink.core.application.company.impl.CompanyServiceImpl;
import com.internlink.core.application.exception_case.impl.InternshipCaseServiceImpl;
import com.internlink.core.application.organization.impl.*;
import com.internlink.core.application.placement.impl.*;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.application.system.impl.AuditLogServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.*;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenRevocationService;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.company.dto.request.CompanyRequest;
import com.internlink.core.presentation.exception_case.dto.request.InternshipCaseRequest;
import com.internlink.core.presentation.organization.dto.request.*;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.AccountLockedException;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.UnauthorizedException;
import com.internlink.core.shared.security.SecurityGuard;

import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

class CorePlacementServicesTest extends CoreServiceTestFixture {
    @Test
    void placementActivationRequiresApprovedAgreement() {
        InternshipPlacementMapper placementMapper =
                new InternshipPlacementMapper(profileRepository);
        PlacementTransitionValidator transitionValidator =
                new PlacementTransitionValidator(finalResultRepository);
        PlacementNotificationHelper notificationHelper =
                new PlacementNotificationHelper(auditLogService, notificationService);
        InternshipPlacementServiceImpl service =
                new InternshipPlacementServiceImpl(
                        placementRepository,
                        agreementRepository,
                        userRepository,
                        termRepository,
                        securityGuard,
                        placementMapper,
                        transitionValidator,
                        notificationHelper,
                        new com.internlink.core.shared.api.PaginatedResponseMapper());
        LearningAgreement agreement =
                LearningAgreement.builder().status(AgreementStatus.DRAFT).build();
        agreement.setId(UUID.randomUUID());
        when(agreementRepository.findById(agreement.getId())).thenReturn(Optional.of(agreement));

        assertThatThrownBy(
                        () ->
                                service.activatePlacementFromAgreement(
                                        agreement.getId(), UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void reportedCaseStartsOpenAndKeepsReporter() {
        InternshipCaseServiceImpl service =
                new InternshipCaseServiceImpl(caseRepository, placementRepository, userRepository);
        User reporter = user(UserRole.STUDENT);
        Company company =
                Company.builder().companyName("Acme").taxCode("123").address(Map.of()).build();
        company.setId(UUID.randomUUID());
        InternshipPlacement placement =
                InternshipPlacement.builder().student(reporter).company(company).build();
        placement.setId(UUID.randomUUID());
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        when(userRepository.findById(reporter.getId())).thenReturn(Optional.of(reporter));
        when(caseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        InternshipCaseRequest request =
                InternshipCaseRequest.builder()
                        .placementId(placement.getId())
                        .caseType(CaseType.INCIDENT)
                        .severity(CaseSeverity.HIGH)
                        .summary("Incident")
                        .build();

        var response = service.reportCase(reporter.getId(), request);

        assertThat(response.getStatus()).isEqualTo(CaseStatus.OPEN);
        assertThat(response.getReportedByUserId()).isEqualTo(reporter.getId());
    }

}
