package com.internlink.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.internlink.core.application.organization.impl.AcademicProgramServiceImpl;
import com.internlink.core.application.organization.impl.DepartmentServiceImpl;
import com.internlink.core.application.organization.impl.InternshipTermServiceImpl;
import com.internlink.core.application.organization.impl.StudentRosterAccountProvisioner;
import com.internlink.core.application.organization.impl.StudentRosterIneligibleNotifier;
import com.internlink.core.application.organization.impl.StudentRosterMapper;
import com.internlink.core.application.organization.impl.StudentRosterServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.organization.dto.request.AcademicProgramRequest;
import com.internlink.core.presentation.organization.dto.request.DepartmentRequest;
import com.internlink.core.presentation.organization.dto.request.InternshipTermRequest;
import com.internlink.core.presentation.organization.dto.request.StudentRosterImportItem;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

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
                        new StudentRosterMapper(),
                        mock(StudentRosterAccountProvisioner.class),
                        mock(StudentRosterIneligibleNotifier.class));
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
