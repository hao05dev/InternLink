package com.internlink.core.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricEvaluationResponse {

    private Long id;
    private Long learningAgreementId;
    private String evaluationType;
    private String evaluatorRole;
    private Long evaluatorUserId;
    private String evaluatorName;
    private Double totalScore;
    private String strengthsObserved;
    private String areasForImprovement;
    private String futureRecommendations;
    private LocalDateTime evaluatedAt;
    private List<CriteriaScoreDto> criteriaScores;
}
