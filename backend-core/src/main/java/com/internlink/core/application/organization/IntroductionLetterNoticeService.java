package com.internlink.core.application.organization;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.infrastructure.integration.google.GmailSender;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipTermRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.TermGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IntroductionLetterNoticeService {
    private final JpaInternshipTermRepository terms;
    private final JpaStudentRosterRepository rosters;
    private final JpaUserRepository users;
    private final SecurityGuard securityGuard;
    private final GmailSender gmail;
    private final NotificationService notifications;
    private final AuditLogService audit;
    private final PlatformTransactionManager transactionManager;

    public record NoticeResult(int eligible, int emailsSent, int notificationsCreated, List<String> failedStudentCodes) {}
    private record Recipient(String studentCode, String email, UUID userId) {}
    private record NoticeBatch(String termName, List<Recipient> recipients) {}

    public NoticeResult send(UUID termId, String pickupLocation, LocalDate pickupDate) {
        if (pickupLocation == null || pickupLocation.isBlank() || pickupLocation.length() > 300 || pickupDate == null)
            throw new BadRequestException("Cần ngày và địa điểm nhận giấy giới thiệu");
        UUID actorId = securityGuard.currentUser().getId();
        TransactionTemplate read = new TransactionTemplate(transactionManager);
        read.setReadOnly(true);
        NoticeBatch batch = read.execute(status -> {
            var term = terms.findById(termId).orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
            TermGuard.requireNotClosed(term);
            var actor = users.findById(actorId).orElseThrow();
            ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor, term.getDepartment().getId()));
            List<Recipient> recipients = rosters.findByTermId(termId).stream()
                .filter(roster -> roster.getEligibilityStatus() == EligibilityStatus.ELIGIBLE)
                .map(roster -> new Recipient(roster.getStudentCode(), roster.getOfficialEmail(),
                    roster.getClaimedUser() != null ? roster.getClaimedUser().getId()
                        : users.findByEmail(roster.getOfficialEmail()).map(user -> user.getId()).orElse(null)))
                .toList();
            if (recipients.isEmpty()) throw new BadRequestException("Kỳ này chưa có sinh viên đủ điều kiện để thông báo");
            return new NoticeBatch(term.getTermName(), recipients);
        });
        if (batch == null) throw new IllegalStateException("Không tải được danh sách sinh viên");
        String subject = "Thông báo nhận giấy giới thiệu thực tập - " + batch.termName();
        String body = "Bạn vui lòng đến " + pickupLocation.trim() + " từ ngày " + pickupDate
            + " để nhận bản cứng giấy giới thiệu thực tập cho kỳ " + batch.termName() + ".";
        int emails = 0;
        int inApp = 0;
        java.util.ArrayList<String> failures = new java.util.ArrayList<>();
        for (Recipient recipient : batch.recipients()) {
            try { gmail.send(recipient.email(), subject, body); emails++; }
            catch (RuntimeException error) { failures.add(recipient.studentCode()); }
            if (recipient.userId() != null) {
                notifications.sendNotification(recipient.userId(), "INTRODUCTION_LETTER_PICKUP", subject, body, "/student/dashboard");
                inApp++;
            }
        }
        audit.logAction(actorId, "NOTIFY_INTRODUCTION_LETTER_PICKUP", "InternshipTerm", termId,
            failures.isEmpty() ? "SUCCESS" : "PARTIAL", Map.of("eligible", batch.recipients().size(), "emailsSent", emails,
                "notificationsCreated", inApp), null);
        return new NoticeResult(batch.recipients().size(), emails, inApp, failures);
    }
}
