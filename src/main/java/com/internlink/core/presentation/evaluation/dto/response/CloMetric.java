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

    /** Số sinh viên đạt kết quả ĐẠT (PASSED) */
    private Long passedStudentsCount;

    /** Tỷ lệ đạt chuẩn đầu ra (%) */
    private BigDecimal attainmentRate;

    /** Điểm trung bình của sinh viên thuộc chuẩn đầu ra này (thang 10) */
    private BigDecimal averageScore;
}
