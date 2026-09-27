package com.internlink.core.application;

import com.internlink.core.application.evaluation.impl.FinalResultServiceImpl;
import com.internlink.core.application.evaluation.impl.RubricEvaluationServiceImpl;
import com.internlink.core.application.student.impl.StudentProfileServiceImpl;
import com.internlink.core.application.system.impl.DocumentServiceImpl;
import com.internlink.core.application.system.impl.NotificationServiceImpl;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.evaluation.AssessmentScheme;
import com.internlink.core.domain.evaluation.AssessmentComponentScore;
import com.internlink.core.domain.evaluation.RubricEvaluation;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.domain.placement.InternshipReport;
import com.internlink.core.domain.placement.WeeklyLogbook;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.domain.system.Notification;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.request.RubricEvaluationRequest;
import com.internlink.core.presentation.student.dto.request.StudentProfileRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.infrastructure.integration.storage.StorageServiceRouter;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationAndSystemServiceTest {

    @Mock JpaRubricEvaluationRepository rubricRepository;
    @Mock JpaAssessmentComponentScoreRepository componentScoreRepository;
    @Mock JpaInternshipReportRepository reportRepository;
    @Mock JpaStudentFoundApplicationRepository studentFoundApplicationRepository;
    @Mock JpaInternshipPlacementRepository placementRepository;
    @Mock JpaUserRepository userRepository;
    @Mock JpaFinalResultRepository finalResultRepository;
    @Mock JpaStudentProfileRepository studentProfileRepository;
    @Mock JpaAcademicProgramRepository programRepository;
    @Mock JpaNotificationRepository notificationRepository;
    @Mock JpaDocumentRepository documentRepository;
    @Mock JpaJobApplicationRepository applicationRepository;
    @Mock JpaLearningAgreementRepository agreementRepository;
    @Mock JpaPlacementTaskRepository taskRepository;
    @Mock JpaWeeklyLogbookRepository logbookRepository;
    @Mock JpaInternshipCaseRepository caseRepository;
    @Mock NotificationService notificationSender;
    @Mock SecurityGuard securityGuard;
    @Mock AuditLogService auditLogService;
    @Mock StorageServiceRouter storageServiceRouter;

    private RubricEvaluationServiceImpl rubricService;
    private FinalResultServiceImpl finalResultService;
    private StudentProfileServiceImpl profileService;
    private NotificationServiceImpl notificationService;
    private DocumentServiceImpl documentService;

    @BeforeEach
    void setUp() {
        rubricService = new RubricEvaluationServiceImpl(rubricRepository, placementRepository, userRepository, securityGuard);
        notificationService = new NotificationServiceImpl(notificationRepository, userRepository);
        finalResultService = new FinalResultServiceImpl(finalResultRepository, placementRepository,
            userRepository, studentProfileRepository, componentScoreRepository,
            logbookRepository, reportRepository, securityGuard, auditLogService, notificationSender);
        profileService = new StudentProfileServiceImpl(studentProfileRepository, userRepository, programRepository);
        documentService = new DocumentServiceImpl(documentRepository, userRepository, securityGuard, storageServiceRouter,
            applicationRepository, studentFoundApplicationRepository, agreementRepository, placementRepository, taskRepository,
            logbookRepository, rubricRepository, caseRepository);
        lenient().when(rubricRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(finalResultRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(placementRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(studentProfileRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void rubricRejectsRoleNotSupportedByDatabaseConstraint() {
        InternshipPlacement placement = placement();
        User admin = user(UserRole.ADMIN);
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(admin));

        assertThatThrownBy(() -> rubricService.submitEvaluation(admin.getId(), rubricRequest(placement.getId())))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void rubricDraftDoesNotSetSubmittedTimestamp() {
        InternshipPlacement placement = placement();
        User mentor = placement.getMentor();
        RubricEvaluationRequest request = rubricRequest(placement.getId());
        request.setStatus("draft");
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        when(userRepository.findById(mentor.getId())).thenReturn(Optional.of(mentor));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(mentor));
        when(rubricRepository.findByPlacementIdAndEvaluatorIdAndEvaluationStage(
            placement.getId(), mentor.getId(), request.getEvaluationStage())).thenReturn(Optional.empty());

        assertThat(rubricService.submitEvaluation(mentor.getId(), request).getSubmittedAt()).isNull();
    }

    @Test
    void finalResultUsesApprovedCourseSchemeAndCompletesPlacement() {
        InternshipPlacement placement = placement();
        AssessmentScheme scheme = AssessmentScheme.builder().term(placement.getTerm())
            .components(List.of(Map.of("code", "HOST", "name", "Cơ sở", "weight", "0.60", "assessorRole", "COMPANY_MENTOR"),
                Map.of("code", "REPORT", "name", "Báo cáo", "weight", "0.40", "assessorRole", "LECTURER")))
            .requiredLogbookWeeks(1).requireMidtermReport(false).requireFinalReport(true)
            .courseCode("CT454").revision(1).status("APPROVED").build();
        scheme.setId(UUID.randomUUID());
        placement.setAssessmentScheme(scheme);
        WeeklyLogbook logbook = WeeklyLogbook.builder().placement(placement).weekNumber(1)
            .status(LogbookStatus.APPROVED_BY_MENTOR).build();
        Document reportFile = Document.builder().status("ACTIVE").build();
        InternshipReport report = InternshipReport.builder().placement(placement).reportType("FINAL")
            .document(reportFile).status("APPROVED").build();
        AssessmentComponentScore hostScore = AssessmentComponentScore.builder().placement(placement)
            .componentCode("HOST").score(new BigDecimal("8.0")).status("VERIFIED")
            .source("ONLINE").criteriaScores(Map.of()).build();
        AssessmentComponentScore lecturerScore = AssessmentComponentScore.builder().placement(placement)
            .componentCode("REPORT").score(new BigDecimal("7.0")).status("VERIFIED")
            .source("ONLINE").criteriaScores(Map.of()).build();
        User admin = user(UserRole.ADMIN);
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(finalResultRepository.findByPlacementId(placement.getId())).thenReturn(Optional.empty());
        when(studentProfileRepository.findById(placement.getStudent().getId())).thenReturn(Optional.empty());
        when(logbookRepository.findByPlacementIdOrderByWeekNumberAsc(placement.getId())).thenReturn(List.of(logbook));
        when(reportRepository.findByPlacementId(placement.getId())).thenReturn(List.of(report));
        when(componentScoreRepository.findByPlacementId(placement.getId())).thenReturn(List.of(hostScore, lecturerScore));
        FinalResultRequest request = FinalResultRequest.builder().placementId(placement.getId()).publishImmediately(true).build();

        var response = finalResultService.calculateAndFinalizeResult(admin.getId(), request);
        assertThat(response.getFinalScore()).isEqualByComparingTo("7.6");
        assertThat(response.getScoreScale4()).isEqualByComparingTo("3.0");
        assertThat(response.getLetterGrade()).isEqualTo("B");
        assertThat(placement.getStatus()).isEqualTo(PlacementStatus.COMPLETED);
    }

    @Test
    void studentProfileRejectsDuplicateStudentCode() {
        User student = user(UserRole.STUDENT);
        Department department = department();
        AcademicProgram program = program(department);
        StudentProfile existing = StudentProfile.builder().userId(UUID.randomUUID())
            .user(user(UserRole.STUDENT)).program(program).studentCode("B2012345").build();
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(programRepository.findById(program.getId())).thenReturn(Optional.of(program));
        when(studentProfileRepository.findByStudentCode("B2012345")).thenReturn(Optional.of(existing));
        StudentProfileRequest request = StudentProfileRequest.builder().programId(program.getId())
            .studentCode("b2012345").build();

        assertThatThrownBy(() -> profileService.createOrUpdateProfile(student.getId(), request))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void notificationCanOnlyBeReadByRecipient() {
        User recipient = user(UserRole.STUDENT);
        Notification notification = Notification.builder().recipient(recipient).notificationType("INFO")
            .title("Title").message("Message").build();
        notification.setId(UUID.randomUUID());
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markAsRead(notification.getId(), UUID.randomUUID()))
            .isInstanceOf(ForbiddenException.class);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void documentRegistrationRejectsNegativeSizeBeforePersistence() {
        User owner = user(UserRole.STUDENT);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> documentService.registerDocument(owner.getId(), ContextType.PROFILE,
            UUID.randomUUID(), DocumentType.CV, "cv.pdf", "application/pdf", -1L, "https://file"))
            .isInstanceOf(BadRequestException.class);
        verify(documentRepository, never()).save(any());
    }

    @Test
    void unrelatedLecturerCannotReadStudentsCv() {
        User owner = user(UserRole.STUDENT);
        User lecturer = user(UserRole.LECTURER);
        Document cv = Document.builder().owner(owner).contextType(ContextType.PROFILE)
            .contextId(owner.getId()).documentType(DocumentType.CV).build();
        cv.setId(UUID.randomUUID());
        when(documentRepository.findById(cv.getId())).thenReturn(Optional.of(cv));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(lecturer));
        when(userRepository.findById(lecturer.getId())).thenReturn(Optional.of(lecturer));

        assertThatThrownBy(() -> documentService.downloadDocument(cv.getId(), lecturer.getId()))
            .isInstanceOf(ForbiddenException.class);
        verify(storageServiceRouter, never()).getStorageService(any());
    }

    @Test
    void noSchemeCannotBeUsedAsFinalScore() {
        InternshipPlacement placement = placement();
        User admin = user(UserRole.ADMIN);
        when(placementRepository.findById(placement.getId())).thenReturn(Optional.of(placement));
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(finalResultRepository.findByPlacementId(placement.getId())).thenReturn(Optional.empty());
        FinalResultRequest request = FinalResultRequest.builder().placementId(placement.getId()).build();

        assertThatThrownBy(() -> finalResultService.calculateAndFinalizeResult(admin.getId(), request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("phương án đánh giá");
        verify(finalResultRepository, never()).save(any());
    }

    private RubricEvaluationRequest rubricRequest(UUID placementId) {
        return RubricEvaluationRequest.builder().placementId(placementId).evaluationStage(RubricStage.FINAL)
            .rubricVersion("v1").criteriaScores(List.of(Map.of("score", 8)))
            .finalScore(new BigDecimal("8.0")).status("SUBMITTED").build();
    }

    private InternshipPlacement placement() {
        User student = user(UserRole.STUDENT);
        User mentor = user(UserRole.COMPANY_MENTOR);
        User lecturer = user(UserRole.LECTURER);
        Company company = Company.builder().companyName("Acme").taxCode("123").address(Map.of()).build();
        company.setId(UUID.randomUUID());
        Department department = department();
        InternshipTerm term = InternshipTerm.builder().department(department).code("T1").termName("Term").build();
        term.setId(UUID.randomUUID());
        LearningAgreement agreement = LearningAgreement.builder().student(student).company(company)
            .department(department).targetCredits(10).learningObjectives("Objectives").build();
        agreement.setId(UUID.randomUUID());
        InternshipPlacement value = InternshipPlacement.builder().agreement(agreement).student(student)
            .company(company).mentor(mentor).lecturer(lecturer).term(term)
            .totalHoursWorked(BigDecimal.ZERO).status(PlacementStatus.ACTIVE).build();
        value.setId(UUID.randomUUID());
        return value;
    }

    private User user(UserRole role) {
        User value = User.builder().email(UUID.randomUUID() + "@example.com").passwordHash("hash")
            .fullName("User").role(role).build();
        value.setId(UUID.randomUUID());
        return value;
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
}
