package com.internlink.core.dto.student;

import jakarta.validation.constraints.NotBlank;

public record StudentSkillDto(
        @NotBlank(message = "Skill ID is required") String skillId,

        String skillName,
        String proficiencyLevel,
        Double yearsExperience) {
}