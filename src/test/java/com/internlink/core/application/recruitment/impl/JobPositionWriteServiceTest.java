package com.internlink.core.application.recruitment.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.security.SecurityGuard;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

class JobPositionWriteServiceTest extends RecruitmentTestFixture {
    @Test
    void companyCannotSelfApproveJobThroughCreatePayload() {
        Department department = department();
        InternshipTerm term = term(department);
        Company company = company();
        User representative = user(UserRole.COMPANY_REP);
        representative.setCompany(company);
        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(userRepository.findById(representative.getId()))
                .thenReturn(Optional.of(representative));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(representative));

        JobPositionRequest request = jobRequest(company.getId(), term.getId(), department.getId());
        request.setStatus(JobStatus.APPROVED);

        assertThat(jobService.createJob(request, representative.getId()).getStatus())
                .isEqualTo(JobStatus.DRAFT);
    }

    @Test
    void createJobRejectsDepartmentOutsideTerm() {
        Department termDepartment = department();
        Department otherDepartment = department();
        InternshipTerm term = term(termDepartment);
        Company company = company();
        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(departmentRepository.findById(otherDepartment.getId()))
                .thenReturn(Optional.of(otherDepartment));

        assertThatThrownBy(
                        () ->
                                jobService.createJob(
                                        jobRequest(
                                                company.getId(),
                                                term.getId(),
                                                otherDepartment.getId()),
                                        UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void representativeCannotCreateJobForAnotherCompany() {
        Department department = department();
        InternshipTerm term = term(department);
        Company targetCompany = company();
        User representative = user(UserRole.COMPANY_REP);
        representative.setCompany(company());
        when(companyRepository.findById(targetCompany.getId()))
                .thenReturn(Optional.of(targetCompany));
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));
        when(userRepository.findById(representative.getId()))
                .thenReturn(Optional.of(representative));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(representative));

        assertThatThrownBy(
                        () ->
                                jobService.createJob(
                                        jobRequest(
                                                targetCompany.getId(),
                                                term.getId(),
                                                department.getId()),
                                        representative.getId()))
                .isInstanceOf(ForbiddenException.class);
        verify(jobRepository, never()).save(any());
    }

}
