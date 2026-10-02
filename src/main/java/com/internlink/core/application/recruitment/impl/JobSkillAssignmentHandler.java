package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.domain.recruitment.JobSkillId;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.request.JobSkillRequest;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JobSkillAssignmentHandler {

    private final JpaJobSkillRepository jobSkillRepository;
    private final JpaSkillTaxonomyRepository taxonomyRepository;

    public void saveJobSkills(JobPosition job, JobPositionRequest request) {
        List<JobSkill> skillsToSave = new ArrayList<>();

        // 1. Lưu từ danh sách skills chi tiết nếu có
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            for (JobSkillRequest skillReq : request.getSkills()) {
                if (skillReq == null || skillReq.getSkillId() == null || skillReq.getSkillId().isBlank()) {
                    throw new BadRequestException("Mã kỹ năng không được để trống");
                }
                SkillTaxonomy taxonomy = requireSkill(skillReq.getSkillId());
                JobSkill jobSkill = JobSkill.builder()
                    .id(new JobSkillId(job.getId(), taxonomy.getId()))
                    .job(job)
                    .skill(taxonomy)
                    .requirementType(skillReq.getRequirementType() != null ? skillReq.getRequirementType() : RequirementType.MANDATORY)
                    .requiredLevel(skillReq.getRequiredLevel())
                    .weight(skillReq.getWeight() != null ? skillReq.getWeight() : BigDecimal.ONE)
                    .build();
                skillsToSave.add(jobSkill);
            }
        }

        // 2. Lưu từ mandatorySkillIds nếu có
        if (request.getMandatorySkillIds() != null && !request.getMandatorySkillIds().isEmpty()) {
            for (String skillId : request.getMandatorySkillIds()) {
                if (skillsToSave.stream().noneMatch(s -> s.getId().getSkillId().equals(skillId))) {
                    SkillTaxonomy taxonomy = requireSkill(skillId);
                    JobSkill jobSkill = JobSkill.builder()
                        .id(new JobSkillId(job.getId(), taxonomy.getId()))
                        .job(job)
                        .skill(taxonomy)
                        .requirementType(RequirementType.MANDATORY)
                        .weight(BigDecimal.ONE)
                        .build();
                    skillsToSave.add(jobSkill);
                }
            }
        }

        // 3. Lưu từ optionalSkillIds nếu có
        if (request.getOptionalSkillIds() != null && !request.getOptionalSkillIds().isEmpty()) {
            for (String skillId : request.getOptionalSkillIds()) {
                if (skillsToSave.stream().noneMatch(s -> s.getId().getSkillId().equals(skillId))) {
                    SkillTaxonomy taxonomy = requireSkill(skillId);
                    JobSkill jobSkill = JobSkill.builder()
                        .id(new JobSkillId(job.getId(), taxonomy.getId()))
                        .job(job)
                        .skill(taxonomy)
                        .requirementType(RequirementType.OPTIONAL)
                        .weight(BigDecimal.valueOf(0.5))
                        .build();
                    skillsToSave.add(jobSkill);
                }
            }
        }

        if (!skillsToSave.isEmpty()) {
            jobSkillRepository.saveAll(skillsToSave);
        }
    }

    public SkillTaxonomy requireSkill(String skillId) {
        if (skillId == null || skillId.isBlank()) {
            throw new BadRequestException("Mã kỹ năng không được để trống");
        }
        return taxonomyRepository.findById(skillId)
            .orElseThrow(() -> new BadRequestException("Kỹ năng không tồn tại trong từ điển: " + skillId));
    }
}
