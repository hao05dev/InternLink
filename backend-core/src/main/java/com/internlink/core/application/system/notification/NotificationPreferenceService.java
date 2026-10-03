package com.internlink.core.application.system.notification;
import com.internlink.core.domain.system.NotificationPreference;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.infrastructure.persistence.jpa.JpaNotificationPreferenceRepository;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service @RequiredArgsConstructor
public class NotificationPreferenceService {
    private final JpaNotificationPreferenceRepository repository;
    private final SecurityGuard guard;
    private final EmailProperties settings;
    public record Preferences(boolean emailEnabled, boolean workflowEmail, boolean reminderEmail,
                              boolean announcementEmail, boolean systemEmail, boolean emailServiceEnabled) {}
    @Transactional(readOnly=true)
    public Preferences get() {
        UUID id = guard.currentUser().getId();
        return response(repository.findById(id).orElseGet(() -> NotificationPreference.builder().userId(id).build()));
    }
    @Transactional
    public Preferences update(Preferences request) {
        UUID id = guard.currentUser().getId();
        return response(repository.save(NotificationPreference.builder().userId(id).emailEnabled(request.emailEnabled())
            .workflowEmail(request.workflowEmail()).reminderEmail(request.reminderEmail())
            .announcementEmail(request.announcementEmail()).systemEmail(request.systemEmail()).build()));
    }
    private Preferences response(NotificationPreference row) {
        return new Preferences(row.isEmailEnabled(),row.isWorkflowEmail(),row.isReminderEmail(),
            row.isAnnouncementEmail(),row.isSystemEmail(),settings.isEnabled());
    }
}
