package com.internlink.core.dto.evaluation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricEvaluationRequest {

    @NotNull(message = "ID thỏa thuận thực tập không được để trống")
    private Long learningAgreementId;

    @NotBlank(message = "Loại đánh giá không được để trống (MIDTERM, FINAL)")
    private String evaluationType;

    @NotBlank(message = "Vai trò người đánh giá không được để trống (COMPANY_MENTOR, ACADEMIC_SUPERVISOR, STUDENT_SELF, COUNCIL_MEMBER)")
    private String evaluatorRole;

    private String strengthsObserved;

    private String areasForImprovement;

    private String futureRecommendations;

    @NotEmpty(message = "Danh sách điểm tiêu chí không được rỗng")
    @Valid
    private List<CriteriaScoreDto> criteriaScores;
}
