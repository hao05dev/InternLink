package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.domain.ai_matching.StudentSkillId;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.domain.recruitment.JobSkillId;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.enums.SkillCategory;
import com.internlink.core.shared.enums.SkillSource;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiMatchingServiceImplTest {

    @Mock
    private JpaSkillTaxonomyRepository taxonomyRepository;

    @Mock
    private JpaStudentSkillRepository studentSkillRepository;

    @Mock
    private JpaAiRunRepository aiRunRepository;

    @Mock
    private JpaJobPositionRepository jobPositionRepository;

    @Mock
    private JpaJobSkillRepository jobSkillRepository;

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private JpaDocumentRepository documentRepository;

    @Mock
    private JpaJobApplicationRepository applicationRepository;

    @Mock
    private JpaInternshipPlacementRepository placementRepository;

    @Mock
    private JpaStudentProfileRepository studentProfileRepository;

    @Mock
    private AiServiceClient aiServiceClient;

    @Mock
    private SecurityGuard securityGuard;

    @InjectMocks
    private AiMatchingServiceImpl service;

    @Test
    void adminRetryKeepsOriginalHistoryAndDoesNotOverwriteConfirmedSkill() {
        UUID originalId = UUID.randomUUID(), studentId = UUID.randomUUID(), newId = UUID.randomUUID();
        User student = student(studentId);
        AiRun original = AiRun.builder().id(originalId).student(student).runType(AiRunType.CV_EXTRACTION)
            .status(AiRunStatus.FAILED).inputSnapshot(Map.of("text_length", 4)).build();
        SkillTaxonomy java = taxonomy("skill-java", "Java");
        StudentSkill confirmed = studentSkill(studentId, java);
        when(aiRunRepository.findForRetryById(originalId)).thenReturn(Optional.of(original));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(aiServiceClient.extractSkills("Java")).thenReturn(Map.of("normalized_skills", List.of(Map.of("id", "skill-java"))));
        when(taxonomyRepository.findById("skill-java")).thenReturn(Optional.of(java));
        when(studentSkillRepository.findById(new StudentSkillId(studentId, "skill-java"))).thenReturn(Optional.of(confirmed));
        when(studentSkillRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(aiRunRepository.save(any())).thenAnswer(invocation -> {
            AiRun run = invocation.getArgument(0);
            if (run.getId() == null) run.setId(newId);
            return run;
        });
        assertThat(service.reprocessFailedCvRun(originalId, "Java")).isEqualTo(newId);
        verify(securityGuard).requireRole(UserRole.ADMIN);
        assertThat(original.getStatus()).isEqualTo(AiRunStatus.FAILED);
        assertThat(original.getInputSnapshot()).containsEntry("retry_run_id", newId.toString());
        assertThat(confirmed.getIsConfirmed()).isTrue();
        assertThatThrownBy(() -> service.reprocessFailedCvRun(originalId, "Java")).isInstanceOf(BadRequestException.class);
        verify(aiServiceClient, times(1)).extractSkills("Java");
    }

    @Test
    void retryFailureCreatesFailedRunWithoutChangingSkills() {
        UUID originalId = UUID.randomUUID(), studentId = UUID.randomUUID(), newId = UUID.randomUUID();
        User student = student(studentId);
        AiRun original = AiRun.builder().id(originalId).student(student).runType(AiRunType.CV_EXTRACTION)
            .status(AiRunStatus.FAILED).inputSnapshot(Map.of()).build();
        when(aiRunRepository.findForRetryById(originalId)).thenReturn(Optional.of(original));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(aiServiceClient.extractSkills("Java")).thenReturn(Map.of("status", "FAILED"));
        when(aiRunRepository.save(any())).thenAnswer(invocation -> {
            AiRun run = invocation.getArgument(0);
            if (run.getId() == null) run.setId(newId);
            return run;
        });
        service.reprocessFailedCvRun(originalId, "Java");
        ArgumentCaptor<AiRun> captor = ArgumentCaptor.forClass(AiRun.class);
        verify(aiRunRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues().getFirst().getStatus()).isEqualTo(AiRunStatus.FAILED);
        assertThat(captor.getAllValues().getFirst().getErrorDetail()).containsKey("message");
        verifyNoInteractions(studentSkillRepository);
    }

    @Test
    void completedRunsCannotBeRetried() {
        UUID id = UUID.randomUUID();
        when(aiRunRepository.findForRetryById(id)).thenReturn(Optional.of(AiRun.builder().id(id)
            .student(student(UUID.randomUUID())).runType(AiRunType.CV_EXTRACTION).status(AiRunStatus.COMPLETED).build()));
        assertThatThrownBy(() -> service.reprocessFailedCvRun(id, "Java")).isInstanceOf(BadRequestException.class);
        verifyNoInteractions(aiServiceClient);
    }

    @Test
    void syncCvSkillsStoresNormalizedAiSkillsAndSkipsUnknownTaxonomy() {
        UUID studentId = UUID.randomUUID();
        User student = student(studentId);
        SkillTaxonomy java = taxonomy("skill-java", "Java");
        SkillTaxonomy spring = taxonomy("skill-spring", "Spring Boot");

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(student));
        when(aiServiceClient.extractSkills("Java Spring Boot"))
            .thenReturn(Map.of(
                "normalized_skills", List.of(
                    Map.of("id", "skill-java", "name", "Java"),
                    Map.of("id", "skill-spring", "name", "Spring Boot", "confidence", 0.87),
                    Map.of("id", "skill-unknown", "name", "Unknown")
                )
            ));
        when(taxonomyRepository.findById("skill-java")).thenReturn(Optional.of(java));
        when(taxonomyRepository.findById("skill-spring")).thenReturn(Optional.of(spring));
        when(taxonomyRepository.findById("skill-unknown")).thenReturn(Optional.empty());
        when(studentSkillRepository.findById(any(StudentSkillId.class))).thenReturn(Optional.empty());
        when(studentSkillRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<StudentSkillResponse> responses = service.syncCvSkills(studentId, null, "Java Spring Boot");

        assertThat(responses).extracting(StudentSkillResponse::getSkillId)
            .containsExactly("skill-java", "skill-spring");
        // Human-in-the-loop: kỹ năng từ CV phải chờ sinh viên duyệt (isConfirmed = false)
        assertThat(responses).allSatisfy(response -> assertThat(response.getIsConfirmed()).isFalse());
        assertThat(responses.get(0).getConfidence()).isNull();
        assertThat(responses.get(1).getConfidence()).isEqualByComparingTo(BigDecimal.valueOf(0.87));

        ArgumentCaptor<AiRun> runCaptor = ArgumentCaptor.forClass(AiRun.class);
        verify(aiRunRepository).save(runCaptor.capture());
        assertThat(runCaptor.getValue().getStudent()).isEqualTo(student);
        assertThat(runCaptor.getValue().getOutputResult()).containsKey("normalized_skills");
    }

    @Test
    void syncCvSkillsDoesNotOverwriteStudentDeclaredSkill() {
        UUID studentId = UUID.randomUUID();
        User student = student(studentId);
        SkillTaxonomy java = taxonomy("skill-java", "Java");
        StudentSkill existing = StudentSkill.builder()
            .id(new StudentSkillId(studentId, "skill-java"))
            .student(student)
            .skill(java)
            .source(SkillSource.STUDENT_DECLARED)
            .isConfirmed(false)
            .confidence(BigDecimal.valueOf(0.4))
            .build();

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(student));
        when(aiServiceClient.extractSkills("Java"))
            .thenReturn(Map.of("skills", List.of(Map.of("skill_id", "skill-java", "confidence", 0.91))));
        when(taxonomyRepository.findById("skill-java")).thenReturn(Optional.of(java));
        when(studentSkillRepository.findById(new StudentSkillId(studentId, "skill-java"))).thenReturn(Optional.of(existing));
        when(studentSkillRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<StudentSkillResponse> responses = service.syncCvSkills(studentId, null, "Java");

        assertThat(responses).isEmpty();
        assertThat(existing.getSource()).isEqualTo(SkillSource.STUDENT_DECLARED);
        assertThat(existing.getConfidence()).isEqualByComparingTo(BigDecimal.valueOf(0.4));
    }

    @Test
    void syncCvSkillsThrowsWhenStudentDoesNotExist() {
        UUID studentId = UUID.randomUUID();
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(student(studentId)));
        when(userRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.syncCvSkills(studentId, null, "Java"))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(aiServiceClient, never()).extractSkills(any());
    }

    @Test
    void syncCvSkillsRejectsDocumentOwnedByAnotherStudent() {
        UUID studentId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        User student = student(studentId);
        Document foreignCv = Document.builder().owner(student(UUID.randomUUID()))
            .documentType(DocumentType.CV).build();
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(student));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(foreignCv));

        assertThatThrownBy(() -> service.syncCvSkills(studentId, documentId, "Java"))
            .isInstanceOf(ForbiddenException.class);
        verify(aiServiceClient, never()).extractSkills(any());
    }

    @Test
    void unrelatedCompanyCannotReadStudentSkills() {
        UUID studentId = UUID.randomUUID();
        User representative = student(UUID.randomUUID());
        representative.setRole(UserRole.COMPANY_REP);
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(representative));
        when(userRepository.findById(representative.getId())).thenReturn(Optional.of(representative));

        assertThatThrownBy(() -> service.getSkillsByStudent(studentId))
            .isInstanceOf(ForbiddenException.class);
        verify(studentSkillRepository, never()).findByIdStudentId(studentId);
    }

    @Test
    void confirmStudentSkillPersistsConfirmationFlag() {
        UUID studentId = UUID.randomUUID();
        SkillTaxonomy java = taxonomy("skill-java", "Java");
        StudentSkill skill = StudentSkill.builder()
            .id(new StudentSkillId(studentId, "skill-java"))
            .student(student(studentId))
            .skill(java)
            .source(SkillSource.CV_AI)
            .isConfirmed(true)
            .build();

        CustomUserDetail userDetail = CustomUserDetail.builder()
            .id(studentId)
            .email("student@example.com")
            .role(UserRole.STUDENT)
            .build();
        when(securityGuard.currentUser()).thenReturn(userDetail);
        when(studentSkillRepository.findById(new StudentSkillId(studentId, "skill-java"))).thenReturn(Optional.of(skill));
        when(studentSkillRepository.save(skill)).thenReturn(skill);

        StudentSkillResponse response = service.confirmStudentSkill(studentId, "skill-java", false);

        assertThat(response.getIsConfirmed()).isFalse();
        verify(studentSkillRepository).save(skill);
        verify(securityGuard).requireSelf(studentId, studentId, "StudentSkill");
    }

    @Test
    void calculateMatchScoreUsesConfirmedStudentSkillsAndJobSkills() {
        UUID studentId = UUID.randomUUID();
        UUID jobId = UUID.randomUUID();
        JobPosition job = job(jobId, "Backend Intern", "InternLink Co");

        SkillTaxonomy java = taxonomy("skill-java", "Java");
        SkillTaxonomy spring = taxonomy("skill-spring", "Spring Boot");
        SkillTaxonomy docker = taxonomy("skill-docker", "Docker");

        when(jobPositionRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(studentSkillRepository.findByIdStudentIdAndIsConfirmedTrue(studentId))
            .thenReturn(List.of(studentSkill(studentId, java), studentSkill(studentId, spring)));
        when(jobSkillRepository.findByIdJobId(jobId))
            .thenReturn(List.of(jobSkill(jobId, java, RequirementType.MANDATORY), jobSkill(jobId, docker, RequirementType.OPTIONAL)));
        when(aiServiceClient.calculateMatchScore(
            eq(studentId),
            eq(jobId),
            eq("Backend Intern"),
            eq("Description"),
            eq(""),
            eq(List.of("skill-java", "skill-spring")),
            eq(List.of("skill-java")),
            eq(List.of("skill-docker"))
        )).thenReturn(Map.of(
            "match_percentage", "76.5",
            "matched_skills", List.of("skill-java"),
            "missing_skills", List.of("skill-docker"),
            "explanation", Map.of("recommendation", "Review Docker")
        ));

        AiMatchScoreResponse response = service.calculateMatchScoreForJob(studentId, jobId);

        assertThat(response.getJobId()).isEqualTo(jobId);
        assertThat(response.getJobTitle()).isEqualTo("Backend Intern");
        assertThat(response.getCompanyName()).isEqualTo("InternLink Co");
        assertThat(response.getMatchScore()).isEqualByComparingTo("76.5");
        assertThat(response.getMatchedSkills()).containsExactly("skill-java");
        assertThat(response.getMissingSkills()).containsExactly("skill-docker");
        assertThat(response.getExplanation()).containsEntry("recommendation", "Review Docker");
    }

    @Test
    void recommendJobsForStudentSortsScoresDescendingAndSkipsFailedJobs() {
        UUID studentId = UUID.randomUUID();
        UUID termId = UUID.randomUUID();
        UUID highJobId = UUID.randomUUID();
        UUID lowJobId = UUID.randomUUID();
        UUID failedJobId = UUID.randomUUID();

        JobPosition highJob = job(highJobId, "High Match", "A");
        JobPosition lowJob = job(lowJobId, "Low Match", "B");
        JobPosition failedJob = job(failedJobId, "Broken", "C");
        SkillTaxonomy java = taxonomy("skill-java", "Java");

        when(jobPositionRepository.findByTermIdAndStatus(termId, JobStatus.APPROVED))
            .thenReturn(List.of(lowJob, failedJob, highJob));
        when(jobPositionRepository.findById(lowJobId)).thenReturn(Optional.of(lowJob));
        when(jobPositionRepository.findById(failedJobId)).thenThrow(new IllegalStateException("Cannot score"));
        when(jobPositionRepository.findById(highJobId)).thenReturn(Optional.of(highJob));
        when(studentSkillRepository.findByIdStudentIdAndIsConfirmedTrue(studentId))
            .thenReturn(List.of(studentSkill(studentId, java)));
        when(jobSkillRepository.findByIdJobId(lowJobId)).thenReturn(List.of(jobSkill(lowJobId, java, RequirementType.MANDATORY)));
        when(jobSkillRepository.findByIdJobId(highJobId)).thenReturn(List.of(jobSkill(highJobId, java, RequirementType.MANDATORY)));
        when(aiServiceClient.calculateMatchScore(eq(studentId), eq(lowJobId), any(), any(), eq(""), eq(List.of("skill-java")), eq(List.of("skill-java")), eq(List.of())))
            .thenReturn(Map.of("match_score", 40.0));
        when(aiServiceClient.calculateMatchScore(eq(studentId), eq(highJobId), any(), any(), eq(""), eq(List.of("skill-java")), eq(List.of("skill-java")), eq(List.of())))
            .thenReturn(Map.of("match_score", 90.0));

        List<AiMatchScoreResponse> responses = service.recommendJobsForStudent(studentId, termId);

        assertThat(responses).extracting(AiMatchScoreResponse::getJobTitle)
            .containsExactly("High Match", "Low Match");
    }

    private User student(UUID id) {
        User user = User.builder()
            .email("student@example.com")
            .passwordHash("hash")
            .fullName("Student")
            .role(UserRole.STUDENT)
            .build();
        user.setId(id);
        return user;
    }

    private SkillTaxonomy taxonomy(String id, String name) {
        return SkillTaxonomy.builder()
            .id(id)
            .skillName(name)
            .category(SkillCategory.TECHNICAL)
            .build();
    }

    private StudentSkill studentSkill(UUID studentId, SkillTaxonomy taxonomy) {
        return StudentSkill.builder()
            .id(new StudentSkillId(studentId, taxonomy.getId()))
            .student(student(studentId))
            .skill(taxonomy)
            .source(SkillSource.CV_AI)
            .isConfirmed(true)
            .build();
    }

    private JobSkill jobSkill(UUID jobId, SkillTaxonomy taxonomy, RequirementType reqType) {
        return JobSkill.builder()
            .id(new JobSkillId(jobId, taxonomy.getId()))
            .skill(taxonomy)
            .requirementType(reqType != null ? reqType : RequirementType.MANDATORY)
            .build();
    }

    private JobPosition job(UUID id, String title, String companyName) {
        Company company = Company.builder()
            .companyName(companyName)
            .taxCode("tax-" + id)
            .address(Map.of())
            .build();
        JobPosition job = JobPosition.builder()
            .company(company)
            .title(title)
            .description("Description")
            .build();
        job.setId(id);
        return job;
    }
}
