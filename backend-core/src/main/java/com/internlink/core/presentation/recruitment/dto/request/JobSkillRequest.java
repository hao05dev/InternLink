package com.internlink.core.presentation.recruitment.dto.request;

import com.internlink.core.shared.enums.RequirementType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillRequest {

    @NotBlank(message = "Mã kỹ năng không được để trống")
    private String skillId;

    @Builder.Default
    private RequirementType requirementType = RequirementType.MANDATORY;

    private String requiredLevel;

    @Builder.Default
    private BigDecimal weight = BigDecimal.ONE;
}
