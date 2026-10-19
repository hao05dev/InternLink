package com.internlink.core.presentation.evaluation.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperEvaluationOverrideRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @NotNull(message = "Điểm của cơ quan không được để trống")
    @DecimalMin(value = "0.0", message = "Điểm tối thiểu là 0.0")
    @DecimalMax(value = "10.0", message = "Điểm tối đa là 10.0")
    private BigDecimal mentorScore;

    @NotBlank(message = "Nhận xét của cơ quan không được để trống")
    private String mentorFeedback;

    private String proofUrl;

    private UUID evidenceDocumentId;
}
