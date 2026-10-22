package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobSkillAssignmentHandlerTest {

    @Mock
    private JpaJobSkillRepository jobSkillRepository;

    @Mock
    private JpaSkillTaxonomyRepository taxonomyRepository;

    private JobSkillAssignmentHandler handler;

    @BeforeEach
    void setUp() {
        handler = new JobSkillAssignmentHandler(jobSkillRepository, taxonomyRepository);
    }

    @Test
    void requireSkill_byId() {
        SkillTaxonomy java = SkillTaxonomy.builder().id("SK-JAVA").skillName("Java").build();
        when(taxonomyRepository.findByIdAndIsActiveTrue("SK-JAVA")).thenReturn(Optional.of(java));

        SkillTaxonomy result = handler.requireSkill("SK-JAVA");
        assertThat(result.getId()).isEqualTo("SK-JAVA");
    }

    @Test
    void requireSkill_byName() {
        SkillTaxonomy java = SkillTaxonomy.builder().id("SK-JAVA").skillName("Java").build();
        when(taxonomyRepository.findByIdAndIsActiveTrue("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCaseAndIsActiveTrue("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCaseAndIsActiveTrue("Java")).thenReturn(Optional.of(java));

        SkillTaxonomy result = handler.requireSkill("Java");
        assertThat(result.getId()).isEqualTo("SK-JAVA");
        assertThat(result.getSkillName()).isEqualTo("Java");
    }

    @Test
    void requireSkill_byAlias() {
        SkillTaxonomy js = SkillTaxonomy.builder()
            .id("SK-JS")
            .skillName("JavaScript")
            .aliases(List.of("js", "es6"))
            .build();
        when(taxonomyRepository.findByIdAndIsActiveTrue("js")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCaseAndIsActiveTrue("js")).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCaseAndIsActiveTrue("js")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIsActiveTrue()).thenReturn(List.of(js));

        SkillTaxonomy result = handler.requireSkill("js");
        assertThat(result.getId()).isEqualTo("SK-JS");
    }

    @Test
    void requireSkill_rejectsUnreviewedSkill() {
        when(taxonomyRepository.findByIdAndIsActiveTrue(anyString())).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCaseAndIsActiveTrue(anyString())).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCaseAndIsActiveTrue(anyString())).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIsActiveTrue()).thenReturn(List.of());

        assertThatThrownBy(() -> handler.requireSkill("Apache Kafka"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("chưa có trong danh mục đã duyệt");
        verify(taxonomyRepository, never()).save(any(SkillTaxonomy.class));
    }

    @Test
    void requireSkill_throwsWhenBlank() {
        assertThatThrownBy(() -> handler.requireSkill("   "))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Mã kỹ năng không được để trống");
    }

    @Test
    void saveJobSkills_deduplicatesSkills() {
        JobPosition job = JobPosition.builder().build();
        job.setId(UUID.randomUUID());
        SkillTaxonomy java = SkillTaxonomy.builder().id("SK-JAVA").skillName("Java").build();

        // One requested by ID SK-JAVA, another by name "Java" -> both resolve to SK-JAVA
        when(taxonomyRepository.findByIdAndIsActiveTrue("SK-JAVA")).thenReturn(Optional.of(java));
        when(taxonomyRepository.findByIdAndIsActiveTrue("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCaseAndIsActiveTrue("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCaseAndIsActiveTrue("Java")).thenReturn(Optional.of(java));

        JobPositionRequest request = JobPositionRequest.builder()
            .mandatorySkillIds(List.of("SK-JAVA", "Java"))
            .build();

        handler.saveJobSkills(job, request);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<JobSkill>> captor = ArgumentCaptor.forClass(List.class);
        verify(jobSkillRepository).saveAll(captor.capture());

        List<JobSkill> saved = captor.getValue();
        assertThat(saved).hasSize(1);
        assertThat(saved.get(0).getSkill().getId()).isEqualTo("SK-JAVA");
        assertThat(saved.get(0).getRequirementType()).isEqualTo(RequirementType.MANDATORY);
    }
}
