package com.internlink.core.infrastructure.realtime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.application.system.notification.NotificationChanged;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;

import org.junit.jupiter.api.Test;

import java.util.*;

class NotificationStreamHubTest {
    @Test
    void eventRefreshesOnlyItsRecipientAndNeverSendsPrivateBodies() {
        var users = mock(JpaUserRepository.class);
        var notifications = mock(NotificationService.class);
        UUID first = UUID.randomUUID(), second = UUID.randomUUID();
        var user = User.builder().isActive(true).build();
        when(users.findById(any())).thenReturn(Optional.of(user));
        var hub = new NotificationStreamHub(notifications, users);
        hub.open(first);
        hub.open(second);
        clearInvocations(notifications);
        hub.changed(new NotificationChanged(first));
        verify(notifications).countUnreadNotifications(first);
        verifyNoMoreInteractions(notifications);
    }

    @Test
    void disabledAccountCannotReadCountsAndConnectionLimitIsEnforced() {
        var users = mock(JpaUserRepository.class);
        var notifications = mock(NotificationService.class);
        var user = User.builder().isActive(true).build();
        UUID id = UUID.randomUUID();
        when(users.findById(id)).thenReturn(Optional.of(user));
        var hub = new NotificationStreamHub(notifications, users);
        for (int i = 0; i < 5; i++) hub.open(id);
        assertThatThrownBy(() -> hub.open(id)).hasMessageContaining("5");
        clearInvocations(notifications);
        user.setIsActive(false);
        hub.heartbeat();
        verifyNoInteractions(notifications);
    }
}
