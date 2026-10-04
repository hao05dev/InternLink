package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.shared.enums.AiRunStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiRunNotificationHelper {
    private final NotificationService notifications;
    private final com.internlink.core.infrastructure.persistence.jdbc.NotificationEventRepository
            events;

    @org.springframework.transaction.annotation.Transactional
    public void cvCompleted(AiRun run) {
        if (run.getStatus() != AiRunStatus.FAILED && run.getStatus() != AiRunStatus.COMPLETED)
            return;
        if (!events.reserve("ai-cv:" + run.getId() + ":" + run.getStatus())) return;
        boolean failed = run.getStatus() == AiRunStatus.FAILED;
        notifications.sendNotification(
                run.getStudent().getId(),
                failed ? "AI_CV_FAILED" : "AI_CV_COMPLETED",
                failed ? "Chưa phân tích được CV" : "Đã phân tích CV",
                failed
                        ? "Hãy kiểm tra tài liệu nguồn và thử lại trong mục AI."
                        : "Kỹ năng gợi ý đã sẵn sàng. Hãy xem và xác nhận các kỹ năng trước khi sử"
                                + " dụng.",
                "/student/ai");
    }
}
