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

    /** Tự động tổng hợp điểm từ các phiếu Rubric đã nộp của Mentor và Giảng viên */
    @Builder.Default
    private Boolean autoAggregateFromRubrics = true;

    /** Điểm của Mentor doanh nghiệp (nếu ghi đè thủ công, thang 10) */
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal mentorScore;

    /** Điểm của Giảng viên hướng dẫn (nếu ghi đè thủ công, thang 10) */
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal lecturerScore;

    /** Điểm tuân thủ/báo cáo/nhật ký (thang 10) */
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "10.0")
    private BigDecimal complianceScore;

    /** Trọng số điểm Mentor (mặc định 40% = 0.40) */
    @Builder.Default
    private BigDecimal mentorWeight = BigDecimal.valueOf(0.40);

    /** Trọng số điểm Giảng viên (mặc định 40% = 0.40) */
    @Builder.Default
    private BigDecimal lecturerWeight = BigDecimal.valueOf(0.40);

    /** Trọng số điểm Tuân thủ (mặc định 20% = 0.20) */
    @Builder.Default
    private BigDecimal complianceWeight = BigDecimal.valueOf(0.20);

    @Builder.Default
    private Map<String, Object> componentBreakdown = Map.of();

    /**
     * Trạng thái kết quả (PASSED/FAILED).
     * Nếu để trống, hệ thống sẽ tự động suy luận theo thang điểm CTU (>= 4.0 là PASSED).
     */
    private ResultStatus resultStatus;

    /**
     * Công bố kết quả ngay cho sinh viên xem.
     * Mặc định false: lưu nháp để Hội đồng/Khoa rà soát trước khi công bố chính thức.
     */
    @Builder.Default
    private Boolean publishImmediately = false;
}