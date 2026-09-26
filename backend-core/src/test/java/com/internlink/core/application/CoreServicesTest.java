package com.internlink.core.application;

import com.internlink.core.application.auth.impl.AuthServiceImpl;
import com.internlink.core.application.company.impl.CompanyServiceImpl;
import com.internlink.core.application.exception_case.impl.InternshipCaseServiceImpl;
import com.internlink.core.application.organization.impl.*;
import com.internlink.core.application.placement.impl.InternshipPlacementServiceImpl;
import com.internlink.core.application.system.impl.AuditLogServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.*;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.company.dto.request.CompanyRequest;
import com.internlink.core.presentation.exception_case.dto.request.InternshipCaseRequest;
import com.internlink.core.presentation.organization.dto.request.*;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.UnauthorizedException;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoreServicesTest {

    @Mock JpaDepartmentRepository departmentRepository;
    @Mock JpaAcademicProgramRepository programRepository;
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
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtUtil jwtUtil;
    @Mock CookieUtils cookieUtils;
    @Mock HttpServletResponse servletResponse;

    @BeforeEach
    void setUp() {
        lenient().when(departmentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(programRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(companyRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(auditRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        SecurityContextHolder.clearContext();
    }

    @Test
    void departmentCreationNormalizesCodeAndEmail() {
        DepartmentServiceImpl service = new DepartmentServiceImpl(departmentRepository);
        DepartmentRequest request = DepartmentRequest.builder().code("  cit ").name("  CNTT ")
            .contactEmail("  IT@EXAMPLE.COM ").build();

        var response = service.createDepartment(request);

        assertThat(response.getCode()).isEqualTo("CIT");
        assertThat(response.getContactEmail()).isEqualTo("it@example.com");
    }

    @Test
    void academicProgramRejectsDuplicateCode() {
        AcademicProgramServiceImpl service = new AcademicProgramServiceImpl(programRepository, departmentRepository);
        Department department = department();
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(programRepository.existsByCode("SE")).thenReturn(true);
        AcademicProgramRequest request = AcademicProgramRequest.builder().departmentId(department.getId())
            .code("se").name("Software Engineering").build();

        assertThatThrownBy(() -> service.createProgram(request)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void internshipTermRejectsReversedDates() {
        InternshipTermServiceImpl service = new InternshipTermServiceImpl(termRepository, departmentRepository, placementRepository);
        Department department = department();
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        InternshipTermRequest request = InternshipTermRequest.builder().departmentId(department.getId())
            .code("T1").termName("Term").academicYear("2026").semester("1")
            .registrationOpenAt(OffsetDateTime.now()).registrationCloseAt(OffsetDateTime.now().plusDays(1))
            .startDate(LocalDate.now().plusMonths(2)).endDate(LocalDate.now().plusMonths(1))
            .applicationDeadline(OffsetDateTime.now().plusDays(10))
            .evaluationDeadline(OffsetDateTime.now().plusMonths(3)).build();

        assertThatThrownBy(() -> service.createTerm(request)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void rosterRejectsProgramFromAnotherDepartment() {
        StudentRosterServiceImpl service = new StudentRosterServiceImpl(rosterRepository, termRepository, programRepository);
        Department termDepartment = department();
        Department otherDepartment = department();
        InternshipTerm term = term(termDepartment);
        AcademicProgram program = program(otherDepartment);
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(programRepository.findById(program.getId())).thenReturn(Optional.of(program));
        StudentRosterImportItem item = StudentRosterImportItem.builder().programId(program.getId())
            .studentCode("B20").officialEmail("student@example.com").fullName("Student")
            .academicYear("2020").build();

        assertThatThrownBy(() -> service.importRosterList(term.getId(), List.of(item)))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void companyRegistrationRejectsExistingTaxCode() {
        CompanyServiceImpl service = new CompanyServiceImpl(companyRepository, userRepository);
        when(companyRepository.existsByTaxCode("123")).thenReturn(true);
        CompanyRequest request = CompanyRequest.builder().companyName("Acme").taxCode("123")
            .address(Map.of("city", "Can Tho")).build();

        assertThatThrownBy(() -> service.registerCompany(request)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void placementActivationRequiresApprovedAgreement() {
        InternshipPlacementServiceImpl service = new InternshipPlacementServiceImpl(
            placementRepository, agreementRepository, userRepository, profileRepository, finalResultRepository);
        LearningAgreement agreement = LearningAgreement.builder().status(AgreementStatus.DRAFT).build();
        agreement.setId(UUID.randomUUID());
        when(agreementRepository.findById(agreement.getId())).thenReturn(Optional.of(agreement));

        assertThatThrownBy(() -> service.activatePlacementFromAgreement(agreement.getId(), UUID.randomUUID()))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void auditLogSupportsSystemActor() {
        AuditLogServiceImpl service = new AuditLogServiceImpl(auditRepository, userRepository);

        service.logAction(null, "SYNC", "Job", UUID.randomUUID(), "SUCCESS", null, "127.0.0.1");

        var captor = ArgumentCaptor.forClass(com.internlink.core.domain.system.AuditLog.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getActorUser()).isNull();
        assertThat(captor.getValue().getChangedFields()).isEmpty();
    }

    @Test
    void reportedCaseStartsOpenAndKeepsReporter() {
        InternshipCaseServiceImpl service = new InternshipCaseServiceImpl(
            caseRepository, placementRepository, userRepository);
        User reporter = user(UserRole.STUDENT);
        Company company = Company.builder().companyName("Acme").taxCode("123").address(Map.of()).build();
        company.setId(UUID.randomUUID());
        InternshipPlacement placement = InternshipPlacement.builder().student(reporter).company(company).build();
        placement.setId(UUID.randomUUID());
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        when(userRepository.findById(reporter.getId())).thenReturn(Optional.of(reporter));
        when(caseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        InternshipCaseRequest request = InternshipCaseRequest.builder().placementId(placement.getId())
            .caseType(CaseType.INCIDENT).severity(CaseSeverity.HIGH).summary("Incident").build();

        var response = service.reportCase(reporter.getId(), request);

        assertThat(response.getStatus()).isEqualTo(CaseStatus.OPEN);
        assertThat(response.getReportedByUserId()).isEqualTo(reporter.getId());
    }

    @Test
    void authMapsBadCredentialsToDomainUnauthorizedException() {
        AuthServiceImpl service = new AuthServiceImpl(authenticationManager, jwtUtil, cookieUtils, userRepository);
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(
            LoginRequest.builder().email("user@example.com").password("secret").build(), servletResponse))
            .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void authCurrentUserRequiresAuthenticatedPrincipal() {
        AuthServiceImpl service = new AuthServiceImpl(authenticationManager, jwtUtil, cookieUtils, userRepository);

        assertThatThrownBy(service::getCurrentUser).isInstanceOf(UnauthorizedException.class);
    }

    private Department department() {
        Department value = Department.builder().code(UUID.randomUUID().toString()).name("CNTT")
            .contactEmail("it@example.com").build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private AcademicProgram program(Department department) {
        AcademicProgram value = AcademicProgram.builder().department(department).code("SE")
            .name("Software Engineering").build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private InternshipTerm term(Department department) {
        InternshipTerm value = InternshipTerm.builder().department(department).code("T1").termName("Term").build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private User user(UserRole role) {
        User value = User.builder().email(UUID.randomUUID() + "@example.com").passwordHash("hash")
            .fullName("User").role(role).build();
        value.setId(UUID.randomUUID());
        return value;
    }
}
