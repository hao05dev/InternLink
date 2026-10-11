package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.enums.SkillCategory;
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
        when(taxonomyRepository.findById("SK-JAVA")).thenReturn(Optional.of(java));

        SkillTaxonomy result = handler.requireSkill("SK-JAVA");
        assertThat(result.getId()).isEqualTo("SK-JAVA");
    }

    @Test
    void requireSkill_byName() {
        SkillTaxonomy java = SkillTaxonomy.builder().id("SK-JAVA").skillName("Java").build();
        when(taxonomyRepository.findById("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCase("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCase("Java")).thenReturn(Optional.of(java));

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
        when(taxonomyRepository.findById("js")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCase("js")).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCase("js")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIsActiveTrue()).thenReturn(List.of(js));

        SkillTaxonomy result = handler.requireSkill("js");
        assertThat(result.getId()).isEqualTo("SK-JS");
    }

    @Test
    void requireSkill_autoRegisterWhenNotFound() {
        when(taxonomyRepository.findById(anyString())).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIsActiveTrue()).thenReturn(List.of());
        when(taxonomyRepository.save(any(SkillTaxonomy.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillTaxonomy result = handler.requireSkill("Apache Kafka");
        assertThat(result.getId()).isEqualTo("SK-APACHE-KAFKA");
        assertThat(result.getSkillName()).isEqualTo("Apache Kafka");
        assertThat(result.getCategory()).isEqualTo(SkillCategory.TECHNICAL);
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
        when(taxonomyRepository.findById("SK-JAVA")).thenReturn(Optional.of(java));
        when(taxonomyRepository.findById("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findByIdIgnoreCase("Java")).thenReturn(Optional.empty());
        when(taxonomyRepository.findBySkillNameIgnoreCase("Java")).thenReturn(Optional.of(java));

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
