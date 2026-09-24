package com.internlink.core.presentation.evaluation.dto.request;

import com.internlink.core.shared.enums.ResultStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalResultRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal mentorScore;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal lecturerScore;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal complianceScore;

    @Builder.Default
    private Map<String, Object> componentBreakdown = Map.of();

    @NotNull(message = "Kết luận đánh giá không được để trống")
    private ResultStatus resultStatus;
}