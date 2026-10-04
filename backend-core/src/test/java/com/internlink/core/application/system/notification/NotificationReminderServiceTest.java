package com.internlink.core.application.system.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.internlink.core.application.system.NotificationService;

import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

class NotificationReminderServiceTest {
    @Test
    void oneRecipientFailureRollsBackAndDoesNotBlockTheRemainingBatch() {
        var source = mock(ReminderSource.class);
        var notifications = mock(NotificationService.class);
        var transactions = mock(PlatformTransactionManager.class);
        var failed = new SimpleTransactionStatus();
        var succeeded = new SimpleTransactionStatus();
        when(transactions.getTransaction(any())).thenReturn(failed, succeeded);
        var now = OffsetDateTime.now();
        var first =
                new ReminderCandidate(
                        "first",
                        UUID.randomUUID(),
                        "REPORT_REMINDER",
                        "Report",
                        "/student/reports",
                        now);
        var second =
                new ReminderCandidate(
                        "second",
                        UUID.randomUUID(),
                        "REPORT_REMINDER",
                        "Report",
                        "/student/reports",
                        now);
        when(source.pending(now)).thenReturn(List.of(first, second));
        when(source.stillPending(any(), eq(now))).thenReturn(true);
        when(source.reserve(anyString())).thenReturn(true);
        doThrow(new IllegalStateException("fixture"))
                .when(notifications)
                .sendNotification(
                        eq(first.recipientId()),
                        anyString(),
                        anyString(),
                        anyString(),
                        anyString());
        assertThat(new NotificationReminderService(source, notifications, transactions).run(now))
                .isEqualTo(1);
        verify(transactions).rollback(failed);
        verify(transactions).commit(succeeded);
        verify(notifications)
                .sendNotification(
                        eq(second.recipientId()),
                        anyString(),
                        anyString(),
                        anyString(),
                        anyString());
    }
}
