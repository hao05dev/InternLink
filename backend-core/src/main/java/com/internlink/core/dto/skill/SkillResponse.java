package com.internlink.core.dto.skill;

import com.internlink.core.entity.Skill;

public record SkillResponse(
        String id,
        String name,
        String category,
        String escoUri,
        String synonyms) {
    public static SkillResponse fromEntity(Skill skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getEscoUri(),
                skill.getSynonyms());
    }
}