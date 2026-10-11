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
import com.internlink.core.shared.enums.SkillCategory;
import com.internlink.core.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
                SkillTaxonomy taxonomy = requireSkill(skillId);
                if (skillsToSave.stream().noneMatch(s -> s.getId().getSkillId().equals(taxonomy.getId()))) {
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
                SkillTaxonomy taxonomy = requireSkill(skillId);
                if (skillsToSave.stream().noneMatch(s -> s.getId().getSkillId().equals(taxonomy.getId()))) {
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

    public SkillTaxonomy requireSkill(String skillIdentifier) {
        if (skillIdentifier == null || skillIdentifier.isBlank()) {
            throw new BadRequestException("Mã kỹ năng không được để trống");
        }
        String trimmed = skillIdentifier.trim();

        // 1. Direct ID match
        Optional<SkillTaxonomy> match = taxonomyRepository.findById(trimmed);
        if (match.isPresent()) return match.get();

        // 2. Case-insensitive ID match
        match = taxonomyRepository.findByIdIgnoreCase(trimmed);
        if (match.isPresent()) return match.get();

        // 3. Exact skill name case-insensitive
        match = taxonomyRepository.findBySkillNameIgnoreCase(trimmed);
        if (match.isPresent()) return match.get();

        // 4. Match against aliases in active taxonomy
        List<SkillTaxonomy> activeSkills = taxonomyRepository.findByIsActiveTrue();
        if (activeSkills != null) {
            for (SkillTaxonomy taxonomy : activeSkills) {
                if (taxonomy.getAliases() != null && taxonomy.getAliases().stream().anyMatch(a -> a.equalsIgnoreCase(trimmed))) {
                    return taxonomy;
                }
            }
        }

        // 5. Tự động khởi tạo taxonomy cho kỹ năng mới nếu chưa có trong từ điển
        String slug = "SK-" + trimmed.replaceAll("[^a-zA-Z0-9]+", "-").toUpperCase();
        while (slug.endsWith("-")) {
            slug = slug.substring(0, slug.length() - 1);
        }
        while (slug.startsWith("-")) {
            slug = slug.substring(1);
        }
        if (slug.length() > 50) {
            slug = slug.substring(0, 50);
        }
        if (slug.equals("SK") || slug.equals("SK-") || slug.isEmpty()) {
            slug = "SK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        final String finalId = slug;
        return taxonomyRepository.findById(finalId).orElseGet(() -> {
            SkillTaxonomy customSkill = SkillTaxonomy.builder()
                .id(finalId)
                .skillName(trimmed)
                .category(SkillCategory.TECHNICAL)
                .framework("CUSTOM")
                .taxonomyVersion("v1.0")
                .isActive(true)
                .aliases(List.of(trimmed.toLowerCase()))
                .build();
            return taxonomyRepository.save(customSkill);
        });
    }
}
