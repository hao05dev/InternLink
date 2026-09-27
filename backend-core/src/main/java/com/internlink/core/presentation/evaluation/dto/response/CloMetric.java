package com.internlink.core.presentation.evaluation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloMetric {

    /** Mã chuẩn đầu ra (ví dụ: CLO1, CLO2, ...) */
    private String cloCode;

    /** Tên hoặc mô tả chuẩn đầu ra */
    private String description;

    /** Tổng số sinh viên tham gia các vị trí thực tập cam kết chuẩn đầu ra này */
    private Long targetStudentsCount;

    /** Số sinh viên đạt điểm tổng kết trong nhóm vị trí có mục tiêu CLO này. */
    private Long passedStudentsCount;

    /** Chỉ số thay thế: tỷ lệ đạt điểm tổng kết, chưa phải mức đạt CLO trực tiếp. */
    private BigDecimal attainmentRate;

    /** Điểm tổng kết trung bình của nhóm sinh viên (thang 10). */
    private BigDecimal averageScore;

    /** Giúp frontend ghi nhãn đúng cho chỉ số thay thế. */
    private String measurementMethod;
}
