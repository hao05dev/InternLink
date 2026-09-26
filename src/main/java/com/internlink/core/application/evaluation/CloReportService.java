package com.internlink.core.application.evaluation;

import com.internlink.core.presentation.evaluation.dto.response.CloAchievementReport;

import java.util.UUID;

public interface CloReportService {

    /**
     * Lập báo cáo tổng hợp mức độ đạt chuẩn đầu ra (CLO/PLO) cho toàn kỳ thực tập.
     *
     * @param termId ID kỳ thực tập
     * @return Báo cáo chi tiết CLO, phổ điểm và tỷ lệ đạt
     */
    CloAchievementReport generateTermCloReport(UUID termId);

    /**
     * Lập báo cáo chuẩn đầu ra lọc theo chuyên ngành đào tạo cụ thể trong kỳ.
     *
     * @param termId    ID kỳ thực tập
     * @param programId ID chương trình đào tạo
     * @return Báo cáo chi tiết CLO theo ngành
     */
    CloAchievementReport generateProgramCloReport(UUID termId, UUID programId);
}
