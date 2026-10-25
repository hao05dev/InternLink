package com.internlink.core.presentation.ai_matching.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.internlink.core.shared.enums.ProficiencyLevel;
import com.internlink.core.shared.enums.SkillCategory;
import com.internlink.core.shared.enums.SkillSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Phản hồi thông tin kỹ năng của sinh viên, hỗ trợ cả snake_case và camelCase đồng bộ.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class StudentSkillResponse {

    private UUID studentId;
    private String skillId;
    private String skillName;
    private SkillCategory category;
    private SkillSource source;
    private ProficiencyLevel proficiencyLevel;
    private BigDecimal confidence;
    private Boolean isConfirmed;
    private UUID evidenceDocumentId;
    private OffsetDateTime createdAt;
    private Map<String, Object> aiEvidence;

    @JsonProperty("skillId")
    public String getSkillIdCamel() {
        return skillId;
    }

    @JsonProperty("skillName")
    public String getSkillNameCamel() {
        return skillName;
    }

    @JsonProperty("isConfirmed")
    public Boolean getIsConfirmedCamel() {
        return isConfirmed;
    }

    @JsonProperty("aiEvidence")
    public Map<String, Object> getAiEvidenceCamel() {
        return aiEvidence;
    }
}
