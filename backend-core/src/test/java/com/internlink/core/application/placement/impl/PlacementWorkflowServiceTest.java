package com.internlink.core.application.placement.impl;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.placement.*;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.placement.dto.request.AttendanceLogRequest;
import com.internlink.core.presentation.placement.dto.request.WeeklyLogbookRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
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
class PlacementWorkflowServiceTest {

    @Mock JpaAttendanceLogRepository attendanceRepository;
    @Mock JpaInternshipPlacementRepository placementRepository;
    @Mock JpaUserRepository userRepository;
    @Mock JpaPlacementTaskRepository taskRepository;
    @Mock JpaWeeklyLogbookRepository logbookRepository;
    @Mock JpaLearningAgreementRepository agreementRepository;
    @Mock JpaPlacementOfferRepository offerRepository;
    @Mock JpaDepartmentRepository departmentRepository;

    private AttendanceLogServiceImpl attendanceService;
    private PlacementTaskServiceImpl taskService;
    private WeeklyLogbookServiceImpl logbookService;
    private LearningAgreementServiceImpl agreementService;

    @BeforeEach
    void setUp() {
        attendanceService = new AttendanceLogServiceImpl(attendanceRepository, placementRepository, userRepository);
        taskService = new PlacementTaskServiceImpl(taskRepository, placementRepository, userRepository);
        logbookService = new WeeklyLogbookServiceImpl(logbookRepository, placementRepository, userRepository);
        agreementService = new LearningAgreementServiceImpl(agreementRepository, offerRepository,
            departmentRepository, userRepository);
        lenient().when(attendanceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(placementRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(taskRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(logbookRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(agreementRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void checkInRejectsStudentOutsidePlacement() {
        InternshipPlacement placement = placement();
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        AttendanceLogRequest request = attendanceRequest(placement.getId());

        assertThatThrownBy(() -> attendanceService.checkIn(UUID.randomUUID(), request))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void confirmationAddsHoursExactlyOnce() {
        InternshipPlacement placement = placement();
        User mentor = placement.getMentor();
        AttendanceLog log = AttendanceLog.builder().placement(placement).workDate(LocalDate.now())
            .checkInAt(OffsetDateTime.now().minusHours(8)).checkOutAt(OffsetDateTime.now())
            .durationHours(new BigDecimal("8.00")).workFormat(WorkFormat.ONSITE)
            .status(AttendanceStatus.PENDING_CONFIRMATION).build();
        log.setId(UUID.randomUUID());
        when(attendanceRepository.findById(log.getId())).thenReturn(Optional.of(log));
        when(userRepository.findById(mentor.getId())).thenReturn(Optional.of(mentor));

        attendanceService.confirmAttendance(log.getId(), mentor.getId(), AttendanceStatus.CONFIRMED);

        assertThat(placement.getTotalHoursWorked()).isEqualByComparingTo("8.00");
        assertThatThrownBy(() -> attendanceService.confirmAttendance(
            log.getId(), mentor.getId(), AttendanceStatus.CONFIRMED))
            .isInstanceOf(BadRequestException.class);
        verify(placementRepository, times(1)).save(placement);
    }

    @Test
    void taskCanOnlyBeSubmittedByPlacementStudent() {
        InternshipPlacement placement = placement();
        PlacementTask task = PlacementTask.builder().placement(placement).assignedByMentor(placement.getMentor())
            .title("Task").description("Description").status(TaskStatus.ASSIGNED).build();
        task.setId(UUID.randomUUID());
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.submitTask(task.getId(), UUID.randomUUID(), "Done"))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void mentorReviewOnlyAcceptsSubmittedTaskAndTerminalReviewStatuses() {
        InternshipPlacement placement = placement();
        PlacementTask task = PlacementTask.builder().placement(placement).assignedByMentor(placement.getMentor())
            .title("Task").description("Description").status(TaskStatus.SUBMITTED).build();
        task.setId(UUID.randomUUID());
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));
        when(userRepository.findById(placement.getMentor().getId())).thenReturn(Optional.of(placement.getMentor()));

        assertThat(taskService.reviewTask(task.getId(), placement.getMentor().getId(),
            TaskStatus.COMPLETED, "Good", 100).getProgressPercent()).isEqualTo(100);
    }

    @Test
    void logbookRejectsInvalidPeriod() {
        InternshipPlacement placement = placement();
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        WeeklyLogbookRequest request = WeeklyLogbookRequest.builder().placementId(placement.getId())
            .weekNumber(1).periodStart(LocalDate.now()).periodEnd(LocalDate.now().minusDays(1))
            .tasksCompleted("Tasks").learningReflection("Learned").totalHours(BigDecimal.TEN).build();

        assertThatThrownBy(() -> logbookService.submitLogbook(placement.getStudent().getId(), request))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void logbookReviewRejectsUnrelatedMentor() {
        InternshipPlacement placement = placement();
        WeeklyLogbook logbook = WeeklyLogbook.builder().placement(placement).weekNumber(1)
            .periodStart(LocalDate.now()).periodEnd(LocalDate.now()).tasksCompleted("Tasks")
            .learningReflection("Learned").totalHours(BigDecimal.TEN).status(LogbookStatus.SUBMITTED).build();
        logbook.setId(UUID.randomUUID());
        User outsider = user(UserRole.COMPANY_MENTOR);
        when(logbookRepository.findById(logbook.getId())).thenReturn(Optional.of(logbook));
        when(userRepository.findById(outsider.getId())).thenReturn(Optional.of(outsider));

        assertThatThrownBy(() -> logbookService.reviewByMentor(logbook.getId(), outsider.getId(),
            LogbookStatus.APPROVED_BY_MENTOR, null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void agreementCanOnlyBeCreatedByOfferOwner() {
        PlacementOffer offer = offer();
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        var request = com.internlink.core.presentation.placement.dto.request.LearningAgreementRequest.builder()
            .offerId(offer.getId()).departmentId(offer.getApplication().getJob().getDepartment().getId())
            .targetCredits(10).learningObjectives("Objectives").build();

        assertThatThrownBy(() -> agreementService.createAgreement(UUID.randomUUID(), request))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void thirdSignatureApprovesAgreement() {
        PlacementOffer offer = offer();
        Department department = offer.getApplication().getJob().getDepartment();
        LearningAgreement agreement = LearningAgreement.builder().offer(offer)
            .student(offer.getApplication().getStudent()).company(offer.getApplication().getJob().getCompany())
            .department(department).targetCredits(10).learningObjectives("Objectives")
            .status(AgreementStatus.PENDING_SIGNATURES).studentSignature(Map.of("signed", true))
            .companySignature(Map.of("signed", true)).build();
        agreement.setId(UUID.randomUUID());
        when(agreementRepository.findById(agreement.getId())).thenReturn(Optional.of(agreement));

        assertThat(agreementService.signAgreement(agreement.getId(), "FACULTY_ADMIN", Map.of("signed", true)).getStatus())
            .isEqualTo(AgreementStatus.APPROVED);
    }

    private AttendanceLogRequest attendanceRequest(UUID placementId) {
        return AttendanceLogRequest.builder().placementId(placementId).workDate(LocalDate.now())
            .checkInAt(OffsetDateTime.now()).workFormat(WorkFormat.ONSITE).build();
    }

    private InternshipPlacement placement() {
        User student = user(UserRole.STUDENT);
        User mentor = user(UserRole.COMPANY_MENTOR);
        User lecturer = user(UserRole.LECTURER);
        Company company = company();
        Department department = department();
        PlacementOffer offer = offer(student, mentor, company, department);
        LearningAgreement agreement = LearningAgreement.builder().offer(offer).student(student)
            .company(company).department(department).targetCredits(10).learningObjectives("Objectives")
            .status(AgreementStatus.APPROVED).build();
        agreement.setId(UUID.randomUUID());
        InternshipPlacement value = InternshipPlacement.builder().agreement(agreement).student(student)
            .company(company).mentor(mentor).lecturer(lecturer).term(offer.getApplication().getJob().getTerm())
            .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3))
            .totalHoursWorked(BigDecimal.ZERO).status(PlacementStatus.ACTIVE).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private PlacementOffer offer() {
        User student = user(UserRole.STUDENT);
        return offer(student, user(UserRole.COMPANY_MENTOR), company(), department());
    }

    private PlacementOffer offer(User student, User mentor, Company company, Department department) {
        InternshipTerm term = InternshipTerm.builder().department(department).code("T1").termName("Term").build();
        term.setId(UUID.randomUUID());
        JobPosition job = JobPosition.builder().company(company).department(department).term(term)
            .title("Intern").workFormat(WorkFormat.ONSITE).location("CT").description("Description")
            .status(JobStatus.APPROVED).build();
        job.setId(UUID.randomUUID());
        Document cv = Document.builder().owner(student).documentType(DocumentType.CV).build();
        cv.setId(UUID.randomUUID());
        JobApplication application = JobApplication.builder().job(job).student(student)
            .submittedCvDocument(cv).status(ApplicationStatus.OFFERED).build();
        application.setId(UUID.randomUUID());
        PlacementOffer value = PlacementOffer.builder().application(application).proposedMentor(mentor)
            .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3))
            .expiresAt(OffsetDateTime.now().plusDays(1)).status(OfferStatus.ACCEPTED).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private User user(UserRole role) {
        User value = User.builder().email(UUID.randomUUID() + "@example.com").passwordHash("hash")
            .fullName("User").role(role).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private Company company() {
        Company value = Company.builder().companyName("Acme").taxCode(UUID.randomUUID().toString())
            .address(Map.of()).verificationStatus(VerificationStatus.VERIFIED).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private Department department() {
        Department value = Department.builder().code(UUID.randomUUID().toString()).name("CNTT")
            .contactEmail("it@example.com").build();
        value.setId(UUID.randomUUID());
        return value;
    }
}
