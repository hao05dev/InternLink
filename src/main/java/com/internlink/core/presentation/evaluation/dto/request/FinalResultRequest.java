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

    /** Trường tương thích API cũ; chỉ chấp nhận true. */
    @Builder.Default
    private Boolean autoAggregateFromRubrics = true;

    /** Trường API cũ; backend từ chối điểm nhập thủ công. */
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

    /** Bắt buộc khi nhập điểm thành phần thủ công thay vì lấy từ rubric. */
    private String overrideReason;

    /** Trường API cũ; trọng số chỉ lấy từ đề cương đã duyệt. */
    private BigDecimal mentorWeight;

    /** Trường API cũ; trọng số chỉ lấy từ đề cương đã duyệt. */
    private BigDecimal lecturerWeight;

    /** Trường API cũ; trọng số chỉ lấy từ đề cương đã duyệt. */
    private BigDecimal complianceWeight;

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
