package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobSkillRepository;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.presentation.recruitment.dto.response.JobSkillResponse;
import com.internlink.core.shared.enums.RequirementType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JobPositionMapper {

    private final JpaJobSkillRepository jobSkillRepository;

    public JobPositionResponse toResponse(JobPosition entity) {
        List<JobSkill> jobSkills = jobSkillRepository.findByIdJobId(entity.getId());
        List<JobSkillResponse> skillResponses = jobSkills.stream()
            .map(js -> JobSkillResponse.builder()
                .skillId(js.getSkill().getId())
                .skillName(js.getSkill().getSkillName())
                .requirementType(js.getRequirementType())
                .requiredLevel(js.getRequiredLevel())
                .weight(js.getWeight())
                .build())
            .toList();

        List<String> mandatory = jobSkills.stream()
            .filter(js -> js.getRequirementType() == RequirementType.MANDATORY)
            .map(js -> js.getSkill().getId())
            .toList();

        List<String> optional = jobSkills.stream()
            .filter(js -> js.getRequirementType() == RequirementType.OPTIONAL)
            .map(js -> js.getSkill().getId())
            .toList();

        return JobPositionResponse.builder()
            .id(entity.getId())
            .companyId(entity.getCompany().getId())
            .companyName(entity.getCompany().getCompanyName())
            .termId(entity.getTerm().getId())
            .termName(entity.getTerm().getTermName())
            .termStatus(entity.getTerm() != null && entity.getTerm().getStatus() != null ? entity.getTerm().getStatus().name() : null)
            .departmentId(entity.getDepartment().getId())
            .departmentName(entity.getDepartment().getName())
            .title(entity.getTitle())
            .workFormat(entity.getWorkFormat())
            .location(entity.getLocation())
            .vacancies(entity.getVacancies())
            .description(entity.getDescription())
            .targetProgramCodes(entity.getTargetProgramCodes())
            .targetLearningOutcomes(entity.getTargetLearningOutcomes())
            .benefits(entity.getBenefits())
            .stipendAmount(entity.getStipendAmount())
            .status(entity.getStatus())
            .facultyFeedback(entity.getFacultyFeedback())
            .approvedByUserId(entity.getApprovedBy() != null ? entity.getApprovedBy().getId() : null)
            .approvedAt(entity.getApprovedAt())
            .createdAt(entity.getCreatedAt())
            .skills(skillResponses)
            .mandatorySkillIds(mandatory)
            .optionalSkillIds(optional)
            .build();
    }
}
