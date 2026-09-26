package com.internlink.core.presentation.evaluation.dto.response;

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
public class CloAchievementReport {

    private UUID termId;
    private String termCode;
    private String termName;

    /** Mã ngành đào tạo nếu báo cáo lọc theo ngành */
    private String programCode;
    private String programName;

    /** Tổng số lượt thực tập trong đợt */
    private Long totalPlacements;

    /** Số lượt đã có kết quả công bố */
    private Long evaluatedPlacements;

    /** Số lượt thực tập đạt kết quả PASSED */
    private Long passedPlacements;

    /** Tỷ lệ đạt kết quả chung (%) */
    private BigDecimal overallPassRate;

    /** Điểm trung bình toàn đợt (thang 10) */
    private BigDecimal averageFinalScore;

    /** Phổ điểm chữ theo thang điểm Đại học Cần Thơ (A, B+, B, C+, C, D+, D, F) */
    private Map<String, Long> letterGradeDistribution;

    /** Chi tiết mức độ đạt theo từng chuẩn đầu ra (CLO) */
    private List<CloMetric> cloMetrics;
}
