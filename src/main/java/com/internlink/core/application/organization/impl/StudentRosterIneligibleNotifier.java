package com.internlink.core.application.organization.impl;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.application.system.notification.EmailOutboxService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.organization.dto.request.IneligibleNoticeRequest;
import com.internlink.core.presentation.organization.dto.response.IneligibleNoticeResponse;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Gửi email và thông báo trong hệ thống cho các sinh viên chưa đủ điều kiện thực tập.
 */
@Component
@RequiredArgsConstructor
public class StudentRosterIneligibleNotifier {

    private final JpaStudentRosterRepository rosterRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final EmailOutboxService gmailSender;
    private final NotificationService notificationService;

    public IneligibleNoticeResponse notifyIneligible(InternshipTerm term, IneligibleNoticeRequest request) {
        List<StudentRoster> ineligibleRosters = rosterRepository.findByTermId(term.getId()).stream()
                .filter(r -> r.getEligibilityStatus() == EligibilityStatus.INELIGIBLE
                        || r.getEligibilityStatus() == EligibilityStatus.NEEDS_REVIEW)
                .toList();

        if (ineligibleRosters.isEmpty()) {
            throw new BadRequestException("Không có sinh viên nào có trạng thái chưa đủ điều kiện trong kỳ này");
        }

        String subjectTemplate = request.getEmailSubjectTemplate() != null && !request.getEmailSubjectTemplate().isBlank()
                ? request.getEmailSubjectTemplate()
                : "Thông báo về điều kiện tham gia thực tập - {{termName}}";

        String bodyTemplate = request.getEmailBodyTemplate() != null && !request.getEmailBodyTemplate().isBlank()
                ? request.getEmailBodyTemplate()
                : """
Kính gửi sinh viên {{studentName}} (MSSV: {{studentCode}}),

Khoa thông báo: Hồ sơ đăng ký thực tập kỳ {{termName}} của bạn hiện CHƯA ĐỦ ĐIỀU KIỆN.
Lý do / Ghi chú: {{eligibilityNote}}

Hạn chót để bổ sung điều kiện / minh chứng: {{supplementDeadline}}
Địa điểm / Kênh tiếp nhận: {{contactInfo}}

Vui lòng liên hệ Văn phòng Khoa để được hỗ trợ chuyển đổi trạng thái sang ĐỦ ĐIỀU KIỆN trước khi hết hạn.
""";

        String deadline = request.getSupplementDeadline() != null && !request.getSupplementDeadline().isBlank()
                ? request.getSupplementDeadline()
                : (term.getRegistrationCloseAt() != null ? term.getRegistrationCloseAt().toLocalDate().toString() : "Hết thời gian mở đăng ký");
        String contact = request.getContactInfo() != null && !request.getContactInfo().isBlank()
                ? request.getContactInfo()
                : "Văn phòng Khoa / Cố vấn học tập";

        int emailsSent = 0;
        int inAppNotifs = 0;
        List<String> failedCodes = new ArrayList<>();

        for (StudentRoster roster : ineligibleRosters) {
            String note = roster.getEligibilityNote() != null && !roster.getEligibilityNote().isBlank()
                    ? roster.getEligibilityNote()
                    : "Chưa tích lũy đủ tín chỉ hoặc chưa hoàn thành học phần tiên quyết theo quy chế";

            String subject = subjectTemplate
                    .replace("{{studentName}}", roster.getFullName())
                    .replace("{{studentCode}}", roster.getStudentCode())
                    .replace("{{termName}}", term.getTermName());

            String body = bodyTemplate
                    .replace("{{studentName}}", roster.getFullName())
                    .replace("{{studentCode}}", roster.getStudentCode())
                    .replace("{{termName}}", term.getTermName())
                    .replace("{{eligibilityNote}}", note)
                    .replace("{{supplementDeadline}}", deadline)
                    .replace("{{contactInfo}}", contact);

            try {
                if (gmailSender.enqueueNotice(roster.getOfficialEmail(), subject, body)) {
                    emailsSent++;
                }
            } catch (RuntimeException err) {
                failedCodes.add(roster.getStudentCode());
            }

            UUID recipientUserId = roster.getClaimedUser() != null
                    ? roster.getClaimedUser().getId()
                    : userRepository.findByEmail(roster.getOfficialEmail()).map(User::getId).orElse(null);

            if (recipientUserId != null) {
                notificationService.sendInAppNotification(
                        recipientUserId, "INELIGIBLE_ROSTER_ALERT", subject, body, "/student/dashboard");
                inAppNotifs++;
            }
        }

        auditLogService.logAction(
                securityGuard.currentUser().getId(),
                "NOTIFY_INELIGIBLE_STUDENTS",
                "InternshipTerm",
                term.getId(),
                failedCodes.isEmpty() ? "SUCCESS" : "PARTIAL",
                Map.of("totalIneligible", ineligibleRosters.size(), "emailsQueued", emailsSent, "notificationsCreated", inAppNotifs),
                null);

        return IneligibleNoticeResponse.builder()
                .totalIneligible(ineligibleRosters.size())
                .emailsSent(0)
                .emailsQueued(emailsSent)
                .notificationsCreated(inAppNotifs)
                .failedStudentCodes(failedCodes)
                .build();
    }
}
