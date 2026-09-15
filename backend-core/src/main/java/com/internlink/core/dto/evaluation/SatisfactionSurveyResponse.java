package com.internlink.core.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SatisfactionSurveyResponse {

    private Long id;
    private Long learningAgreementId;
    private Long submittedByUserId;
    private String submittedByUserName;
    private String targetType;
    private Integer satisfactionScore;
    private Integer workEnvironmentRating;
    private Integer mentorSupportRating;
    private Boolean wouldRecommend;
    private String comments;
    private LocalDateTime createdAt;
}
