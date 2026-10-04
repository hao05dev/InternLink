package com.internlink.core.application.system.notification;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.NotificationPreference;
import com.internlink.core.infrastructure.persistence.jpa.JpaNotificationPreferenceRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class EmailRecipientPolicy {
    private final JpaUserRepository users;
    private final JpaNotificationPreferenceRepository preferences;

    public boolean allows(User user, String type) {
        if (!Boolean.TRUE.equals(user.getIsActive())) return false;
        var prefs =
                preferences
                        .findById(user.getId())
                        .orElseGet(
                                () ->
                                        NotificationPreference.builder()
                                                .userId(user.getId())
                                                .build());
        return NotificationPolicy.wantsEmail(prefs, type);
    }

    @Transactional(readOnly = true)
    public boolean allows(EmailDelivery row) {
        if (row.userId() == null) {
            // A roster address may have been claimed since the campaign was queued.
            return users.findByEmail(row.email())
                    .map(user -> allows(user, row.type()))
                    .orElse(true);
        }
        return users.findById(row.userId())
                .filter(user -> row.email().equalsIgnoreCase(user.getEmail()))
                .map(user -> allows(user, row.type()))
                .orElse(false);
    }
}
