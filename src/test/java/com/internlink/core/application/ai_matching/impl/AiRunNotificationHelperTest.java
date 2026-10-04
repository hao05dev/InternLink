package com.internlink.core.application.ai_matching.impl;

import static org.mockito.Mockito.*;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jdbc.NotificationEventRepository;
import com.internlink.core.shared.enums.AiRunStatus;

import org.junit.jupiter.api.Test;

import java.util.*;

class AiRunNotificationHelperTest {
    @Test
    void cachedRunNotifiesOnceAndDoesNotIncludeCvContents() {
        var notifications = mock(NotificationService.class);
        var events = mock(NotificationEventRepository.class);
        var helper = new AiRunNotificationHelper(notifications, events);
        var student = User.builder().build();
        student.setId(UUID.randomUUID());
        var run =
                AiRun.builder()
                        .id(UUID.randomUUID())
                        .student(student)
                        .status(AiRunStatus.COMPLETED)
                        .inputSnapshot(Map.of("text", "private CV"))
                        .build();
        when(events.reserve(anyString())).thenReturn(true, false);
        helper.cvCompleted(run);
        helper.cvCompleted(run);
        verify(notifications, times(1))
                .sendNotification(
                        eq(student.getId()),
                        eq("AI_CV_COMPLETED"),
                        anyString(),
                        argThat(body -> !body.contains("private CV")),
                        eq("/student/ai"));
        run.setStatus(AiRunStatus.PENDING);
        helper.cvCompleted(run);
        verifyNoMoreInteractions(notifications);
    }
}
