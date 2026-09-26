package com.internlink.core.application.evaluation;

import com.internlink.core.shared.enums.ResultStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Tiện ích chuyển đổi thang điểm theo Quy chế đào tạo Đại học Cần Thơ (CTU).
 *
 * <p>Quy chuẩn thang điểm CTU:
 * <ul>
 *   <li>[9.0 - 10.0] -> Điểm chữ A  (Thang 4: 4.0) - Xuất sắc</li>
 *   <li>[8.0 - 8.9]  -> Điểm chữ B+ (Thang 4: 3.5) - Giỏi</li>
 *   <li>[7.0 - 7.9]  -> Điểm chữ B  (Thang 4: 3.0) - Khá</li>
 *   <li>[6.0 - 6.9]  -> Điểm chữ C+ (Thang 4: 2.5) - Trung bình khá</li>
 *   <li>[5.0 - 5.9]  -> Điểm chữ C  (Thang 4: 2.0) - Trung bình</li>
 *   <li>[4.5 - 4.9]  -> Điểm chữ D+ (Thang 4: 1.5) - Trung bình yếu</li>
 *   <li>[4.0 - 4.4]  -> Điểm chữ D  (Thang 4: 1.0) - Yếu (Đạt)</li>
 *   <li>[ < 4.0 ]    -> Điểm chữ F  (Thang 4: 0.0) - Kém (Không đạt)</li>
 * </ul>
 * </p>
 */
public final class CtuGradingHelper {

    private CtuGradingHelper() {}

    @Getter
    @Builder
    public static class CtuGrade {
        private final BigDecimal scoreScale10;
        private final BigDecimal scoreScale4;
        private final String letterGrade;
        private final String classification;
        private final ResultStatus resultStatus;
    }

    /**
     * Chuyển đổi điểm thang 10 sang thang điểm CTU.
     */
    public static CtuGrade convertFromScale10(BigDecimal score10) {
        if (score10 == null) {
            return CtuGrade.builder()
                .scoreScale10(BigDecimal.ZERO)
                .scoreScale4(BigDecimal.ZERO)
                .letterGrade("F")
                .classification("Kém (Không đạt)")
                .resultStatus(ResultStatus.FAILED)
                .build();
        }

        double score = score10.doubleValue();

        if (score >= 9.0) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(4.0))
                .letterGrade("A")
                .classification("Xuất sắc")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else if (score >= 8.0) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(3.5))
                .letterGrade("B+")
                .classification("Giỏi")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else if (score >= 7.0) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(3.0))
                .letterGrade("B")
                .classification("Khá")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else if (score >= 6.0) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(2.5))
                .letterGrade("C+")
                .classification("Trung bình khá")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else if (score >= 5.0) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(2.0))
                .letterGrade("C")
                .classification("Trung bình")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else if (score >= 4.5) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(1.5))
                .letterGrade("D+")
                .classification("Trung bình yếu")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else if (score >= 4.0) {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(1.0))
                .letterGrade("D")
                .classification("Yếu (Đạt)")
                .resultStatus(ResultStatus.PASSED)
                .build();
        } else {
            return CtuGrade.builder()
                .scoreScale10(score10)
                .scoreScale4(BigDecimal.valueOf(0.0))
                .letterGrade("F")
                .classification("Kém (Không đạt)")
                .resultStatus(ResultStatus.FAILED)
                .build();
        }
    }
}
