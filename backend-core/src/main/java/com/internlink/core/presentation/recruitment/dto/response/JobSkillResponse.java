package com.internlink.core.presentation.recruitment.dto.response;

import com.internlink.core.shared.enums.RequirementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillResponse {
    private String skillId;
    private String skillName;
    private RequirementType requirementType;
    private String requiredLevel;
    private BigDecimal weight;
}
