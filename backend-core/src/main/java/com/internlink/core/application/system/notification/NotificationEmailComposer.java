package com.internlink.core.application.system.notification;

import com.internlink.core.domain.system.Notification;
import com.internlink.core.infrastructure.integration.email.EmailProperties;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEmailComposer {
    public static final String VERSION = "notification-v1";
    private final EmailProperties settings;

    public String body(Notification notification) {
        String path =
                NotificationLinks.normalize(
                        notification.getActionUrl(), notification.getRecipient().getRole());
        return notification.getMessage()
                + "\n\nXem trong InternLink: "
                + settings.getPublicBaseUrl().replaceAll("/+$", "")
                + path
                + "\n\nBạn có thể điều chỉnh email trong mục Thông báo.";
    }
}
