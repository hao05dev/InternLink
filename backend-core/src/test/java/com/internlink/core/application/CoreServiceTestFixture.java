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

@ExtendWith(MockitoExtension.class)
abstract class CoreServiceTestFixture {
    @Mock JpaDepartmentRepository departmentRepository;
    @Mock JpaAcademicProgramRepository programRepository;
    @Mock JpaAssessmentSchemeRepository assessmentSchemeRepository;
    @Mock JpaInternshipTermRepository termRepository;
    @Mock JpaStudentRosterRepository rosterRepository;
    @Mock JpaCompanyRepository companyRepository;
    @Mock JpaUserRepository userRepository;
    @Mock JpaInternshipPlacementRepository placementRepository;
    @Mock JpaLearningAgreementRepository agreementRepository;
    @Mock JpaStudentProfileRepository profileRepository;
    @Mock JpaInternshipCaseRepository caseRepository;
    @Mock JpaAuditLogRepository auditRepository;
    @Mock JpaFinalResultRepository finalResultRepository;
    @Mock AuditLogService auditLogService;
    @Mock NotificationService notificationService;
    @Mock SecurityGuard securityGuard;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtUtil jwtUtil;
    @Mock CookieUtils cookieUtils;
    @Mock TokenRevocationService tokenRevocationService;
    @Mock org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Mock HttpServletResponse servletResponse;

    @BeforeEach
    void setUp() {
        lenient()
                .when(departmentRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        lenient()
                .when(programRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        lenient()
                .when(companyRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        lenient()
                .when(auditRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        SecurityContextHolder.clearContext();
    }

    protected Department department() {
        Department value =
                Department.builder()
                        .code(UUID.randomUUID().toString())
                        .name("CNTT")
                        .contactEmail("it@example.com")
                        .build();
        value.setId(UUID.randomUUID());
        return value;
    }

    protected AcademicProgram program(Department department) {
        AcademicProgram value =
                AcademicProgram.builder()
                        .department(department)
                        .code("SE")
                        .name("Software Engineering")
                        .build();
        value.setId(UUID.randomUUID());
        return value;
    }

    protected InternshipTerm term(Department department) {
        InternshipTerm value =
                InternshipTerm.builder().department(department).code("T1").termName("Term").build();
        value.setId(UUID.randomUUID());
        return value;
    }

    protected User user(UserRole role) {
        User value =
                User.builder()
                        .email(UUID.randomUUID() + "@example.com")
                        .passwordHash("hash")
                        .fullName("User")
                        .role(role)
                        .build();
        value.setId(UUID.randomUUID());
        return value;
    }
}
