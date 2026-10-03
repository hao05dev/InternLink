package com.internlink.core.application.system.notification;
import com.internlink.core.domain.system.Notification;
import com.internlink.core.domain.system.NotificationPreference;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.infrastructure.persistence.jpa.JpaNotificationPreferenceRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service @RequiredArgsConstructor
public class EmailOutboxService {
    private final JdbcTemplate jdbc;
    private final EmailProperties settings;
    private final JpaNotificationPreferenceRepository preferences;
    private final JpaUserRepository users;

    @Transactional
    public String enqueue(Notification notification) {
        if (!settings.isEnabled()) return "DISABLED";
        var user = notification.getRecipient();
        if (!Boolean.TRUE.equals(user.getIsActive())) return "SKIPPED";
        var preference = preferences.findById(user.getId()).orElseGet(() -> NotificationPreference.builder().userId(user.getId()).build());
        if (!NotificationPolicy.wantsEmail(preference, notification.getNotificationType())) return "SKIPPED";
        String path = NotificationLinks.normalize(notification.getActionUrl(), user.getRole());
        String base = settings.getPublicBaseUrl().replaceAll("/+$", "");
        if (!base.matches("https?://[^\\s]+") || base.contains("\r") || base.contains("\n"))
            throw new IllegalStateException("APP_PUBLIC_URL không hợp lệ");
        String body = notification.getMessage() + "\n\nXem trong InternLink: " + base + path
            + "\n\nBạn có thể điều chỉnh email trong mục Thông báo.";
        return insert(user.getEmail(), notification.getTitle(), body, "notification:" + notification.getId(),
            notification.getId(), user.getId(), notification.getNotificationType()) ? "QUEUED" : "DUPLICATE";
    }

    // Only internal, already-authorized faculty commands call this for unclaimed roster addresses.
    @Transactional
    public boolean enqueueNotice(String recipient, String subject, String body) {
        if (!settings.isEnabled()) return false;
        var registered = users.findByEmail(recipient);
        if (registered.isPresent() && !Boolean.TRUE.equals(registered.get().getIsActive())) return false;
        UUID userId = registered.map(user -> user.getId()).orElse(null);
        if (userId != null) {
            var preference = preferences.findById(userId).orElseGet(() -> NotificationPreference.builder().build());
            if (!NotificationPolicy.wantsEmail(preference, "ROSTER_NOTICE")) return false;
        }
        return insert(recipient, subject, body, "notice:" + digest(recipient + "\n" + subject + "\n" + body),
            null, userId, "ROSTER_NOTICE");
    }

    private boolean insert(String recipient, String subject, String body, String key, UUID notificationId, UUID userId, String type) {
        if (recipient == null || !recipient.matches("^[^@\\s\\r\\n]+@[^@\\s\\r\\n]+\\.[^@\\s\\r\\n]+$")
            || recipient.length() > 254 || subject == null || subject.isBlank() || subject.length() > 255
            || subject.contains("\r") || subject.contains("\n") || body == null || body.length() > 50000)
            throw new IllegalArgumentException("Nội dung email không hợp lệ");
        return jdbc.update("""
            INSERT INTO email_outbox(id,notification_id,recipient_user_id,recipient_email,subject,body,event_type,idempotency_key,status,next_attempt_at,created_at)
            VALUES (?,?,?,?,?,?,?,?, 'PENDING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
            ON CONFLICT (idempotency_key) DO NOTHING
            """, UUID.randomUUID(), notificationId, userId, recipient, subject, body, type, key) > 0;
    }
    private static String digest(String text) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
