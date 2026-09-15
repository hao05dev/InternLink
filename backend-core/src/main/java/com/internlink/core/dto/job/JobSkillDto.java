package com.internlink.core.dto.job;

import jakarta.validation.constraints.NotBlank;

public record JobSkillDto(
        @NotBlank(message = "Skill ID is required") String skillId,

        String skillName,
        Boolean isMandatory,
        String requiredLevel) {
}