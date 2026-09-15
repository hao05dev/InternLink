package com.internlink.core.dto.evaluation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SatisfactionSurveyRequest {

    @NotNull(message = "ID thỏa thuận thực tập không được để trống")
    private Long learningAgreementId;

    @NotBlank(message = "Đối tượng khảo sát không được để trống (COMPANY, UNIVERSITY, STUDENT)")
    private String targetType;

    @NotNull(message = "Điểm hài lòng chung không được để trống")
    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5")
    private Integer satisfactionScore;

    @Min(value = 1, message = "Điểm môi trường làm việc tối thiểu là 1")
    @Max(value = 5, message = "Điểm môi trường làm việc tối đa là 5")
    private Integer workEnvironmentRating;

    @Min(value = 1, message = "Điểm hỗ trợ của mentor tối thiểu là 1")
    @Max(value = 5, message = "Điểm hỗ trợ của mentor tối đa là 5")
    private Integer mentorSupportRating;

    @Builder.Default
    private Boolean wouldRecommend = true;

    private String comments;
}
