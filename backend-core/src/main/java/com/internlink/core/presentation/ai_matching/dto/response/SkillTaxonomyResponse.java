package com.internlink.core.presentation.ai_matching.dto.response;

import com.internlink.core.shared.enums.SkillCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillTaxonomyResponse {

    private String id;
    private String skillName;
    private SkillCategory category;
    private String framework;
    private String description;
    private List<String> aliases;
}