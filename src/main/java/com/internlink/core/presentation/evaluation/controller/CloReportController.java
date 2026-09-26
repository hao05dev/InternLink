package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.CloReportService;
import com.internlink.core.presentation.evaluation.dto.response.CloAchievementReport;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports/clo")
@RequiredArgsConstructor
public class CloReportController {

    private final CloReportService cloReportService;

    /**
     * Báo cáo tổng hợp đánh giá chuẩn đầu ra (CLO/PLO) cho toàn bộ kỳ thực tập.
     */
    @GetMapping("/term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<CloAchievementReport>> getTermCloReport(
        @PathVariable UUID termId
    ) {
        CloAchievementReport report = cloReportService.generateTermCloReport(termId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * Báo cáo đánh giá chuẩn đầu ra lọc theo chuyên ngành đào tạo cụ thể trong kỳ.
     */
    @GetMapping("/term/{termId}/program/{programId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<CloAchievementReport>> getProgramCloReport(
        @PathVariable UUID termId,
        @PathVariable UUID programId
    ) {
        CloAchievementReport report = cloReportService.generateProgramCloReport(termId, programId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
