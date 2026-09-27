package com.internlink.core.presentation.ai_matching.dto.response;

import com.internlink.core.shared.enums.SkillCategory;
import com.internlink.core.shared.enums.SkillSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillResponse {

    private UUID studentId;
    private String skillId;
    private String skillName;
    private SkillCategory category;
    private SkillSource source;
    private String proficiencyLevel;
    private BigDecimal confidence;
    private Boolean isConfirmed;
    private UUID evidenceDocumentId;
    private OffsetDateTime createdAt;
}
