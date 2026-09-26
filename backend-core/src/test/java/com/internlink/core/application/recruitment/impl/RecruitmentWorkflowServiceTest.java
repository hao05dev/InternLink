package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecruitmentWorkflowServiceTest {

    @Mock JpaJobPositionRepository jobRepository;
    @Mock JpaCompanyRepository companyRepository;
    @Mock JpaInternshipTermRepository termRepository;
    @Mock JpaDepartmentRepository departmentRepository;
    @Mock JpaUserRepository userRepository;
    @Mock JpaJobApplicationRepository applicationRepository;
    @Mock JpaDocumentRepository documentRepository;
    @Mock JpaPlacementOfferRepository offerRepository;
    @Mock JpaStudentProfileRepository studentProfileRepository;
    @Mock JpaStudentRosterRepository studentRosterRepository;
    @Mock SecurityGuard securityGuard;
    @Mock AuditLogService auditLogService;
    @Mock NotificationService notificationService;
    @Mock JpaJobSkillRepository jobSkillRepository;
    @Mock JpaSkillTaxonomyRepository taxonomyRepository;

    private JobPositionServiceImpl jobService;
    private JobApplicationServiceImpl applicationService;
    private PlacementOfferServiceImpl offerService;

    @BeforeEach
    void setUp() {
        jobService = new JobPositionServiceImpl(jobRepository, companyRepository, termRepository,
            departmentRepository, userRepository, jobSkillRepository, taxonomyRepository);
        applicationService = new JobApplicationServiceImpl(applicationRepository, jobRepository,
            userRepository, documentRepository, studentProfileRepository, studentRosterRepository);
        offerService = new PlacementOfferServiceImpl(offerRepository, applicationRepository, userRepository, securityGuard, auditLogService, notificationService);
        lenient().when(jobRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(offerRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void companyCannotSelfApproveJobThroughCreatePayload() {
        Department department = department();
        InternshipTerm term = term(department);
        Company company = company();
        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(departmentRepository.findById(department.getId())).thenReturn(Optional.of(department));

        JobPositionRequest request = jobRequest(company.getId(), term.getId(), department.getId());
        request.setStatus(JobStatus.APPROVED);

        assertThat(jobService.createJob(request).getStatus()).isEqualTo(JobStatus.DRAFT);
    }

    @Test
    void createJobRejectsDepartmentOutsideTerm() {
        Department termDepartment = department();
        Department otherDepartment = department();
        InternshipTerm term = term(termDepartment);
        Company company = company();
        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(termRepository.findById(term.getId())).thenReturn(Optional.of(term));
        when(departmentRepository.findById(otherDepartment.getId())).thenReturn(Optional.of(otherDepartment));

        assertThatThrownBy(() -> jobService.createJob(jobRequest(company.getId(), term.getId(), otherDepartment.getId())))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void applyJobRejectsCvOwnedByAnotherUser() {
        User student = user(UserRole.STUDENT);
        JobPosition job = job(company(), term(department()), department(), JobStatus.APPROVED);
        Document foreignCv = Document.builder().owner(user(UserRole.STUDENT)).documentType(DocumentType.CV).build();
        foreignCv.setId(UUID.randomUUID());
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(applicationRepository.existsByJobIdAndStudentId(job.getId(), student.getId())).thenReturn(false);
        when(documentRepository.findById(foreignCv.getId())).thenReturn(Optional.of(foreignCv));

        JobApplicationRequest request = JobApplicationRequest.builder()
            .jobId(job.getId()).submittedCvDocumentId(foreignCv.getId()).build();

        assertThatThrownBy(() -> applicationService.applyJob(student.getId(), request))
            .isInstanceOf(BadRequestException.class);
        verify(applicationRepository, never()).save(any());
    }

    @Test
    void applicationStatusRejectsInvalidJump() {
        JobApplication application = application(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> applicationService.updateApplicationStatus(
            application.getId(), ApplicationStatus.OFFERED))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createOfferRequiresActiveReviewAndValidDates() {
        JobApplication application = application(ApplicationStatus.SUBMITTED);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        when(offerRepository.findByApplicationId(application.getId())).thenReturn(Optional.empty());

        PlacementOfferRequest request = offerRequest(application.getId());
        assertThatThrownBy(() -> offerService.createOffer(request)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void declinedOfferAlsoClosesApplication() {
        JobApplication application = application(ApplicationStatus.OFFERED);
        PlacementOffer offer = PlacementOffer.builder()
            .application(application)
            .startDate(LocalDate.now().plusDays(1))
            .endDate(LocalDate.now().plusMonths(3))
            .expiresAt(OffsetDateTime.now().plusDays(1))
            .status(OfferStatus.SENT)
            .termsSnapshot(Map.of())
            .build();
        offer.setId(UUID.randomUUID());
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        assertThat(offerService.respondToOffer(offer.getId(), OfferStatus.DECLINED).getStatus())
            .isEqualTo(OfferStatus.DECLINED);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        verify(applicationRepository).save(application);
    }

    @Test
    void studentCannotSetAdministrativeOfferStatus() {
        PlacementOffer offer = PlacementOffer.builder()
            .application(application(ApplicationStatus.OFFERED))
            .expiresAt(OffsetDateTime.now().plusDays(1))
            .status(OfferStatus.SENT)
            .build();
        offer.setId(UUID.randomUUID());
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        assertThatThrownBy(() -> offerService.respondToOffer(offer.getId(), OfferStatus.WITHDRAWN))
            .isInstanceOf(BadRequestException.class);
    }

    private Department department() {
        Department value = Department.builder().code(UUID.randomUUID().toString()).name("CNTT")
            .contactEmail("it@example.com").build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private InternshipTerm term(Department department) {
        InternshipTerm value = InternshipTerm.builder().department(department).code("T1").termName("Term")
            .academicYear("2026").semester("1").build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private Company company() {
        Company value = Company.builder().companyName("Acme").taxCode(UUID.randomUUID().toString())
            .address(Map.of()).verificationStatus(VerificationStatus.VERIFIED).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private User user(UserRole role) {
        User value = User.builder().email(UUID.randomUUID() + "@example.com").passwordHash("hash")
            .fullName("User").role(role).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private JobPosition job(Company company, InternshipTerm term, Department department, JobStatus status) {
        JobPosition value = JobPosition.builder().company(company).term(term).department(department)
            .title("Java Intern").workFormat(WorkFormat.HYBRID).location("CT")
            .description("Description").status(status).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private JobApplication application(ApplicationStatus status) {
        User student = user(UserRole.STUDENT);
        Department department = department();
        JobPosition job = job(company(), term(department), department, JobStatus.APPROVED);
        Document cv = Document.builder().owner(student).documentType(DocumentType.CV).build();
        cv.setId(UUID.randomUUID());
        JobApplication value = JobApplication.builder().job(job).student(student).submittedCvDocument(cv)
            .status(status).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private JobPositionRequest jobRequest(UUID companyId, UUID termId, UUID departmentId) {
        return JobPositionRequest.builder().companyId(companyId).termId(termId).departmentId(departmentId)
            .title("Java Intern").workFormat(WorkFormat.HYBRID).location("Can Tho")
            .vacancies(2).description("Build services").build();
    }

    private PlacementOfferRequest offerRequest(UUID applicationId) {
        return PlacementOfferRequest.builder().applicationId(applicationId)
            .startDate(LocalDate.now().plusDays(1)).endDate(LocalDate.now().plusMonths(3))
            .expiresAt(OffsetDateTime.now().plusDays(1)).build();
    }
}
