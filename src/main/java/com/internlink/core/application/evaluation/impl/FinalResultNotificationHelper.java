package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.CtuGradingHelper;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.shared.enums.ResultStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FinalResultNotificationHelper {

    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public void logAndNotifyFinalizePublished(UUID decidedByUserId, FinalResult saved, BigDecimal total10,
                                             ResultStatus resolvedStatus, CtuGradingHelper.CtuGrade ctuGrade) {
        auditLogService.logAction(
            decidedByUserId,
            "FINALIZE_AND_PUBLISH_RESULT",
            "FinalResult",
            saved.getId(),
            "SUCCESS",
            Map.of("finalScore", total10, "status", resolvedStatus.name()),
            null
        );

        UUID studentId = saved.getPlacement().getStudent().getId();
        notificationService.sendNotification(
            studentId,
            "FINAL_RESULT_PUBLISHED",
            "Kết quả thực tập chính thức đã công bố",
            String.format("Kết quả thực tập của bạn: Điểm %.1f (Điểm chữ %s, Thang 4: %.1f). Kết quả: %s.",
                total10, ctuGrade.getLetterGrade(), ctuGrade.getScoreScale4(),
                resolvedStatus == ResultStatus.PASSED ? "ĐẠT" : "KHÔNG ĐẠT"),
            "/final-results/placement/" + saved.getPlacement().getId()
        );
    }

    public void logDraft(UUID decidedByUserId, FinalResult saved, BigDecimal total10) {
        auditLogService.logAction(
            decidedByUserId,
            "DRAFT_FINAL_RESULT",
            "FinalResult",
            saved.getId(),
            "SUCCESS",
            Map.of("finalScore", total10, "isDraft", true),
            null
        );
    }

    public void logAndNotifyPublished(UUID publishedByUserId, FinalResult saved, UUID placementId) {
        CtuGradingHelper.CtuGrade ctuGrade = CtuGradingHelper.convertFromScale10(saved.getFinalScore());

        auditLogService.logAction(
            publishedByUserId,
            "PUBLISH_FINAL_RESULT",
            "FinalResult",
            saved.getId(),
            "SUCCESS",
            Map.of("finalScore", saved.getFinalScore(), "status", saved.getResultStatus().name()),
            null
        );

        UUID studentId = saved.getPlacement().getStudent().getId();
        notificationService.sendNotification(
            studentId,
            "FINAL_RESULT_PUBLISHED",
            "Kết quả thực tập chính thức đã công bố",
            String.format("Kết quả thực tập của bạn: Điểm %.1f (Điểm chữ %s, Thang 4: %.1f). Kết quả: %s.",
                saved.getFinalScore(), ctuGrade.getLetterGrade(), ctuGrade.getScoreScale4(),
                saved.getResultStatus() == ResultStatus.PASSED ? "ĐẠT" : "KHÔNG ĐẠT"),
            "/final-results/placement/" + placementId
        );
    }
}
