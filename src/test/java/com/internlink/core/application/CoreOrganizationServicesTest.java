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

class CoreOrganizationServicesTest extends CoreServiceTestFixture {
    @Test
    void departmentCreationNormalizesCodeAndEmail() {
        DepartmentServiceImpl service =
                new DepartmentServiceImpl(departmentRepository, auditLogService, securityGuard);
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(user(UserRole.ADMIN)));
        DepartmentRequest request =
                DepartmentRequest.builder()
                        .code("  cit ")
                        .name("  CNTT ")
                        .contactEmail("  IT@EXAMPLE.COM ")
                        .build();

        var response = service.createDepartment(request);

        assertThat(response.getCode()).isEqualTo("CIT");
        assertThat(response.getContactEmail()).isEqualTo("it@example.com");
    }

    @Test
    void academicProgramRejectsDuplicateCode() {
        AcademicProgramServiceImpl service =
                new AcademicProgramServiceImpl(
                        programRepository,
                        departmentRepository,
                        profileRepository,
                        rosterRepository,
                        assessmentSchemeRepository,
                        auditLogService,
                        securityGuard);
        Department department = department();
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(programRepository.existsByCode("SE")).thenReturn(true);
        AcademicProgramRequest request =
                AcademicProgramRequest.builder()
                        .departmentId(department.getId())
                        .code("se")
                        .name("Software Engineering")
                        .build();

        assertThatThrownBy(() -> service.createProgram(request))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void academicProgramUpdateAndRejectReferencedDelete() {
        AcademicProgramServiceImpl service =
                new AcademicProgramServiceImpl(
                        programRepository,
                        departmentRepository,
                        profileRepository,
                        rosterRepository,
                        assessmentSchemeRepository,
                        auditLogService,
                        securityGuard);
        Department department = department();
        AcademicProgram program = program(department);
        when(programRepository.findById(program.getId())).thenReturn(Optional.of(program));
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(user(UserRole.ADMIN)));

        AcademicProgramRequest updateRequest =
                AcademicProgramRequest.builder()
                        .departmentId(department.getId())
                        .code("SE_NEW")
                        .name("Software Engineering Advanced")
                        .track("REGULAR")
                        .isActive(true)
                        .build();

        var updated = service.updateProgram(program.getId(), updateRequest);
        assertThat(updated.getCode()).isEqualTo("SE_NEW");

        when(profileRepository.existsByProgram_Id(program.getId())).thenReturn(true);
        assertThatThrownBy(() -> service.deleteProgram(program.getId()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void internshipTermRejectsReversedDates() {
        InternshipTermServiceImpl service =
                new InternshipTermServiceImpl(
                        termRepository,
                        departmentRepository,
                        placementRepository,
                        userRepository,
                        securityGuard,
                        auditLogService);
        Department department = department();
        User actor = user(UserRole.FACULTY_ADMIN);
        actor.setDepartment(department);
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(actor));
        when(userRepository.findById(actor.getId())).thenReturn(Optional.of(actor));
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        InternshipTermRequest request =
                InternshipTermRequest.builder()
                        .departmentId(department.getId())
                        .code("T1")
                        .termName("Term")
                        .academicYear("2026")
                        .semester("1")
                        .registrationOpenAt(OffsetDateTime.now())
                        .registrationCloseAt(OffsetDateTime.now().plusDays(1))
                        .startDate(LocalDate.now().plusMonths(2))
                        .endDate(LocalDate.now().plusMonths(1))
                        .applicationDeadline(OffsetDateTime.now().plusDays(10))
                        .evaluationDeadline(OffsetDateTime.now().plusMonths(3))
                        .build();

        assertThatThrownBy(() -> service.createTerm(request))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void rosterRejectsProgramFromAnotherDepartment() {
        StudentRosterServiceImpl service =
                new StudentRosterServiceImpl(
                        rosterRepository,
                        termRepository,
                        programRepository,
                        userRepository,
                        securityGuard,
                        auditLogService,
                        mock(org.springframework.security.crypto.password.PasswordEncoder.class),
                        mock(
                                com.internlink.core.application.system.notification
                                        .EmailOutboxService.class),
                        mock(com.internlink.core.application.system.NotificationService.class));
        Department termDepartment = department();
        User actor = user(UserRole.FACULTY_ADMIN);
        actor.setDepartment(termDepartment);
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(actor));
        when(userRepository.findById(actor.getId())).thenReturn(Optional.of(actor));
        Department otherDepartment = department();
        InternshipTerm term = term(termDepartment);
        AcademicProgram program = program(otherDepartment);
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(programRepository.findById(program.getId())).thenReturn(Optional.of(program));
        StudentRosterImportItem item =
                StudentRosterImportItem.builder()
                        .programId(program.getId())
                        .studentCode("B20")
                        .officialEmail("student@example.com")
                        .fullName("Student")
                        .academicYear("2020")
                        .internshipCourseCode("CT518E")
                        .build();

        assertThatThrownBy(() -> service.importRosterList(term.getId(), List.of(item)))
                .isInstanceOf(BadRequestException.class);
    }

}
