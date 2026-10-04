package com.internlink.core.application.system.notification;

import com.internlink.core.domain.system.Notification;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmailOutboxService {
    private final EmailOutboxStore store;
    private final EmailProperties settings;
    private final EmailRecipientPolicy recipients;
    private final JpaUserRepository users;
    private final NotificationEmailComposer composer;

    @Transactional
    public String enqueue(Notification notification) {
        if (!settings.isEnabled()) return "DISABLED";
        if (!recipients.allows(notification.getRecipient(), notification.getNotificationType()))
            return "SKIPPED";
        return insert(
                        notification.getRecipient().getEmail(),
                        notification.getTitle(),
                        composer.body(notification),
                        "notification:" + notification.getId(),
                        notification.getId(),
                        notification.getRecipient().getId(),
                        notification.getNotificationType())
                ? "QUEUED"
                : "DUPLICATE";
    }

    @Transactional
    public boolean enqueueNotice(String email, String subject, String body) {
        return enqueueNotice(
                email,
                subject,
                body,
                "ROSTER_NOTICE",
                "notice:" + digest(email + "\n" + subject + "\n" + body));
    }

    @Transactional
    public boolean enqueueNotice(
            String email, String subject, String body, String type, String key) {
        if (!settings.isEnabled()) return false;
        var registered = users.findByEmail(email);
        if (registered.isPresent() && !recipients.allows(registered.get(), type)) return false;
        return insert(
                email,
                subject,
                body,
                key,
                null,
                registered.map(user -> user.getId()).orElse(null),
                type);
    }

    private boolean insert(
            String email,
            String subject,
            String body,
            String key,
            UUID notificationId,
            UUID userId,
            String type) {
        if (email == null
                || email.length() > 254
                || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
                || subject == null
                || subject.isBlank()
                || subject.length() > 255
                || subject.contains("\r")
                || subject.contains("\n")
                || body == null
                || body.length() > 50000
                || key == null
                || key.length() > 200)
            throw new IllegalArgumentException("Nội dung email không hợp lệ");
        return store.insert(email, subject, body, key, notificationId, userId, type);
    }

    private static String digest(String value) {
        try {
            return HexFormat.of()
                    .formatHex(
                            MessageDigest.getInstance("SHA-256")
                                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
