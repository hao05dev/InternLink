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
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.JpaAiRunRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.SkillCategory;
import com.internlink.core.shared.enums.SkillSource;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ResourceNotFoundException;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
    private AiServiceClient aiServiceClient;

    @InjectMocks
    private AiMatchingServiceImpl service;

    @Test
    void syncCvSkillsStoresNormalizedAiSkillsAndSkipsUnknownTaxonomy() {
        UUID studentId = UUID.randomUUID();
        User student = student(studentId);
        SkillTaxonomy java = taxonomy("skill-java", "Java");
        SkillTaxonomy spring = taxonomy("skill-spring", "Spring Boot");

        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(aiServiceClient.extractSkillsFromCv(studentId, "Java Spring Boot"))
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
        assertThat(responses).allSatisfy(response -> assertThat(response.getIsConfirmed()).isTrue());
        assertThat(responses.get(0).getConfidence()).isEqualByComparingTo(BigDecimal.ONE);
        assertThat(responses.get(1).getConfidence()).isEqualByComparingTo(BigDecimal.valueOf(0.87));

        ArgumentCaptor<AiRun> runCaptor = ArgumentCaptor.forClass(AiRun.class);
        verify(aiRunRepository).save(runCaptor.capture());
        assertThat(runCaptor.getValue().getStudent()).isEqualTo(student);
        assertThat(runCaptor.getValue().getOutputResult()).containsKey("normalized_skills");
    }

    @Test
    void syncCvSkillsUpdatesExistingSkillWithoutLosingSource() {
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
        when(aiServiceClient.extractSkillsFromCv(studentId, "Java"))
            .thenReturn(Map.of("skills", List.of(Map.of("skill_id", "skill-java", "confidence", 0.91))));
        when(taxonomyRepository.findById("skill-java")).thenReturn(Optional.of(java));
        when(studentSkillRepository.findById(new StudentSkillId(studentId, "skill-java"))).thenReturn(Optional.of(existing));
        when(studentSkillRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<StudentSkillResponse> responses = service.syncCvSkills(studentId, null, "Java");

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getSource()).isEqualTo(SkillSource.STUDENT_DECLARED);
        assertThat(responses.get(0).getConfidence()).isEqualByComparingTo(BigDecimal.valueOf(0.91));
        assertThat(responses.get(0).getIsConfirmed()).isTrue();
    }

    @Test
    void syncCvSkillsThrowsWhenStudentDoesNotExist() {
        UUID studentId = UUID.randomUUID();
        when(userRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.syncCvSkills(studentId, null, "Java"))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(aiServiceClient, never()).extractSkillsFromCv(any(), any());
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

        when(studentSkillRepository.findById(new StudentSkillId(studentId, "skill-java"))).thenReturn(Optional.of(skill));
        when(studentSkillRepository.save(skill)).thenReturn(skill);

        StudentSkillResponse response = service.confirmStudentSkill(studentId, "skill-java", false);

        assertThat(response.getIsConfirmed()).isFalse();
        verify(studentSkillRepository).save(skill);
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
            .thenReturn(List.of(jobSkill(jobId, java), jobSkill(jobId, docker)));
        when(aiServiceClient.calculateMatchScore(
            studentId,
            jobId,
            List.of("skill-java", "skill-spring"),
            List.of("skill-java", "skill-docker")
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
        when(jobSkillRepository.findByIdJobId(lowJobId)).thenReturn(List.of(jobSkill(lowJobId, java)));
        when(jobSkillRepository.findByIdJobId(highJobId)).thenReturn(List.of(jobSkill(highJobId, java)));
        when(aiServiceClient.calculateMatchScore(studentId, lowJobId, List.of("skill-java"), List.of("skill-java")))
            .thenReturn(Map.of("match_score", 40.0));
        when(aiServiceClient.calculateMatchScore(studentId, highJobId, List.of("skill-java"), List.of("skill-java")))
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

    private JobSkill jobSkill(UUID jobId, SkillTaxonomy taxonomy) {
        return JobSkill.builder()
            .id(new JobSkillId(jobId, taxonomy.getId()))
            .skill(taxonomy)
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
