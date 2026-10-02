package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.presentation.ai_matching.dto.response.SkillTaxonomyResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AiMatchingMapper {

    public SkillTaxonomyResponse toTaxonomyResponse(SkillTaxonomy entity) {
        return SkillTaxonomyResponse.builder()
            .id(entity.getId())
            .skillName(entity.getSkillName())
            .category(entity.getCategory())
            .framework(entity.getFramework())
            .description(entity.getDescription())
            .aliases(entity.getAliases())
            .build();
    }

    public StudentSkillResponse toStudentSkillResponse(StudentSkill entity) {
        return StudentSkillResponse.builder()
            .studentId(entity.getId().getStudentId())
            .skillId(entity.getSkill().getId())
            .skillName(entity.getSkill().getSkillName())
            .category(entity.getSkill().getCategory())
            .proficiencyLevel(entity.getProficiencyLevel())
            .source(entity.getSource())
            .confidence(entity.getConfidence())
            .isConfirmed(entity.getIsConfirmed())
            .evidenceDocumentId(entity.getEvidenceDocument() != null ? entity.getEvidenceDocument().getId() : null)
            .createdAt(entity.getCreatedAt())
            .build();
    }

    public List<Map<String, Object>> extractSkillItems(Map<String, Object> aiResult) {
        Object rawSkills = aiResult.getOrDefault("skills", aiResult.get("normalized_skills"));
        if (!(rawSkills instanceof List<?> list)) {
            return List.of();
        }

        List<Map<String, Object>> skills = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> normalized = new HashMap<>();
                map.forEach((key, value) -> {
                    if (key != null) {
                        normalized.put(key.toString(), value);
                    }
                });
                skills.add(normalized);
            }
        }
        return skills;
    }

    public String getString(Map<String, Object> item, String... keys) {
        for (String key : keys) {
            Object value = item.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }

    public BigDecimal extractScore(Map<String, Object> matchResult) {
        Object scoreObj = matchResult.getOrDefault("match_score", matchResult.get("match_percentage"));
        if (scoreObj instanceof Number num) {
            return BigDecimal.valueOf(num.doubleValue());
        }
        if (scoreObj instanceof String text) {
            try {
                return new BigDecimal(text);
            } catch (NumberFormatException ignored) {
            }
        }
        return BigDecimal.ZERO;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractStringList(Object obj) {
        if (obj instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> extractMap(Object obj) {
        if (obj instanceof Map<?, ?> map) {
            Map<String, Object> result = new HashMap<>();
            map.forEach((k, v) -> result.put(String.valueOf(k), v));
            return result;
        }
        return Map.of();
    }
}
