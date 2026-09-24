package com.internlink.core.presentation.evaluation.dto.response;

import com.internlink.core.shared.enums.RubricStage;
import com.internlink.core.shared.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricEvaluationResponse {

    private UUID id;
    private UUID placementId;
    private UUID evaluatorId;
    private String evaluatorName;
    private UserRole evaluatorRole;
    private RubricStage evaluationStage;
    private String rubricVersion;
    private List<Map<String, Object>> criteriaScores;
    private BigDecimal finalScore;
    private String qualitativeFeedback;
    private String status;
    private OffsetDateTime submittedAt;
    private OffsetDateTime createdAt;
}