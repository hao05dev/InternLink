package com.internlink.core.presentation.evaluation.dto.request;

import com.internlink.core.shared.enums.RubricStage;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricEvaluationRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @NotNull(message = "Giai đoạn đánh giá không được để trống")
    private RubricStage evaluationStage;

    @NotBlank(message = "Phiên bản Rubric không được để trống")
    private String rubricVersion;

    @NotNull(message = "Điểm các tiêu chí Rubric không được để trống")
    private List<Map<String, Object>> criteriaScores;

    @NotNull(message = "Điểm tổng kết Rubric không được để trống")
    @DecimalMin(value = "0.0", message = "Điểm tối thiểu là 0.0")
    @DecimalMax(value = "10.0", message = "Điểm tối đa là 10.0")
    private BigDecimal finalScore;

    private String qualitativeFeedback;

    @Builder.Default
    private String status = "SUBMITTED"; // DRAFT hoặc SUBMITTED
}