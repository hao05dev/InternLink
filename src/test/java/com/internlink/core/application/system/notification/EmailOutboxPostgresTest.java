package com.internlink.core.application.system.notification;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.*;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.infrastructure.integration.email.*;
import com.internlink.core.infrastructure.integration.google.GmailSender;
import com.internlink.core.infrastructure.persistence.jpa.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.*;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named="INTERNLINK_TEST_PG_URL",matches=".+")
class EmailOutboxPostgresTest {
    JdbcTemplate jdbc;
    JdbcTemplate admin;
    DataSourceTransactionManager transactions;
    EmailOutboxService queue;
    EmailOutboxWorker worker;
    GmailSender sender;
    JpaUserRepository users;
    JpaNotificationPreferenceRepository preferences;
    User user;
    String schema;

    @BeforeEach void setup() {
        String url=System.getenv("INTERNLINK_TEST_PG_URL");
        admin=new JdbcTemplate(new DriverManagerDataSource(url,"internlink_test",""));
        schema="outbox_test_"+UUID.randomUUID().toString().replace("-","");
        admin.execute("CREATE SCHEMA "+schema);
        var ds=new DriverManagerDataSource(url+(url.contains("?")?"&":"?")+"currentSchema="+schema,"internlink_test","");
        jdbc=new JdbcTemplate(ds);
        transactions=new DataSourceTransactionManager(ds);
        jdbc.execute("CREATE TABLE users(id UUID PRIMARY KEY)");
        jdbc.execute("CREATE TABLE notifications(id UUID PRIMARY KEY, delivery_status JSONB NOT NULL DEFAULT '{}')");
        new ResourceDatabasePopulator(new FileSystemResource("src/main/resources/db/migration/V17__notification_email_outbox_and_r2.sql")).execute(ds);
        users=mock(JpaUserRepository.class); preferences=mock(JpaNotificationPreferenceRepository.class); sender=mock(GmailSender.class);
        user=User.builder().email("student@example.edu").role(UserRole.STUDENT).isActive(true).build();
        user.setId(UUID.randomUUID());
        jdbc.update("INSERT INTO users VALUES (?)",user.getId());
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        var settings=new EmailProperties(); settings.setEnabled(true); settings.setPublicBaseUrl("https://internlink.example");
        queue=new EmailOutboxService(jdbc,settings,preferences,users);
        worker=new EmailOutboxWorker(jdbc,transactions,sender,settings,preferences,users);
    }
    @AfterEach void cleanup() { if(admin!=null && schema!=null) admin.execute("DROP SCHEMA "+schema+" CASCADE"); }
    Notification notification() {
        var n=Notification.builder().id(UUID.randomUUID()).recipient(user).notificationType("APPLICATION_STATUS_CHANGED")
            .title("Hồ sơ thực tập").message("Hồ sơ đã cập nhật").actionUrl("/student/applications").build();
        jdbc.update("INSERT INTO notifications(id) VALUES (?)",n.getId()); return n;
    }
    String state(UUID id) { return jdbc.queryForObject("SELECT status FROM email_outbox WHERE id=?",String.class,id); }

    @Test void rollbackRemovesBusinessNotificationAndEmailTogether() {
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            var n=notification(); assertThat(queue.enqueue(n)).isEqualTo("QUEUED"); tx.setRollbackOnly();
        });
        assertThat(jdbc.queryForObject("SELECT count(*) FROM notifications",Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM email_outbox",Integer.class)).isZero();
        verifyNoInteractions(sender);
    }
    @Test void duplicateNotificationCreatesOnlyOneDelivery() {
        var n=notification();
        assertThat(queue.enqueue(n)).isEqualTo("QUEUED");
        assertThat(queue.enqueue(n)).isEqualTo("DUPLICATE");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM email_outbox",Integer.class)).isEqualTo(1);
    }
    @Test void parallelWorkersClaimDistinctRows() throws Exception {
        queue.enqueue(notification()); queue.enqueue(notification());
        try(var executor=Executors.newFixedThreadPool(2)) {
            var first=executor.submit(worker::claim); var second=executor.submit(worker::claim);
            var a=first.get(5,TimeUnit.SECONDS); var b=second.get(5,TimeUnit.SECONDS);
            assertThat(a.id()).isNotEqualTo(b.id());
            assertThat(a.attempts()).isEqualTo(1); assertThat(a.lease()).isNotNull();
            assertThat(state(a.id())).isEqualTo("SENDING");
            assertThat(worker.claim()).isNull();
        }
    }
    @Test void acceptedEmailUpdatesBothStatuses() {
        var n=notification(); queue.enqueue(n); var row=worker.claim();
        when(sender.deliver(any(),anyString(),anyString(),anyString())).thenReturn("gmail-id");
        worker.deliver(row);
        assertThat(state(row.id())).isEqualTo("SENT");
        assertThat(jdbc.queryForObject("SELECT delivery_status->>'email' FROM notifications WHERE id=?",String.class,n.getId())).isEqualTo("SENT");
        assertThat(jdbc.queryForObject("SELECT provider_message_id FROM email_outbox WHERE id=?",String.class,row.id())).isEqualTo("gmail-id");
    }
    @Test void explicitTemporaryRejectionRetriesAfterDelay() {
        queue.enqueue(notification()); var row=worker.claim();
        when(sender.deliver(any(),anyString(),anyString(),anyString())).thenThrow(new EmailDeliveryException("gmail_http_429",true,false));
        worker.deliver(row);
        assertThat(state(row.id())).isEqualTo("RETRY");
        assertThat(worker.claim()).isNull();
        assertThat(jdbc.queryForObject("SELECT next_attempt_at>CURRENT_TIMESTAMP FROM email_outbox WHERE id=?",Boolean.class,row.id())).isTrue();
    }
    @Test void uncertainAcceptanceIsNeverAutomaticallyResent() {
        queue.enqueue(notification()); var row=worker.claim();
        when(sender.deliver(any(),anyString(),anyString(),anyString())).thenThrow(new EmailDeliveryException("smtp_result_unknown",false,true));
        worker.deliver(row); worker.tick();
        assertThat(state(row.id())).isEqualTo("UNKNOWN");
        verify(sender,times(1)).deliver(any(),anyString(),anyString(),anyString());
    }
    @Test void crashedWorkerLeaseBecomesUnknown() {
        queue.enqueue(notification()); var row=worker.claim();
        jdbc.update("UPDATE email_outbox SET lease_until=CURRENT_TIMESTAMP-INTERVAL '1 minute' WHERE id=?",row.id());
        worker.tick();
        assertThat(state(row.id())).isEqualTo("UNKNOWN"); verifyNoInteractions(sender);
    }
    @Test void preferenceRevokedAfterEnqueuePreventsDelivery() {
        queue.enqueue(notification()); var row=worker.claim();
        when(preferences.findById(user.getId())).thenReturn(Optional.of(NotificationPreference.builder().emailEnabled(false).build()));
        worker.deliver(row);
        assertThat(state(row.id())).isEqualTo("SKIPPED"); verifyNoInteractions(sender);
    }
    @Test void changedEmailAddressPreventsDeliveryToOldAddress() {
        queue.enqueue(notification()); var row=worker.claim(); user.setEmail("new@example.edu");
        worker.deliver(row);
        assertThat(state(row.id())).isEqualTo("SKIPPED"); verifyNoInteractions(sender);
    }
    @Test void inactiveRegisteredUserCannotReceiveRosterNotice() {
        user.setIsActive(false);
        assertThat(queue.enqueueNotice(user.getEmail(),"Thông báo","Nội dung")).isFalse();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM email_outbox",Integer.class)).isZero();
    }
    @Test void staleLeaseCannotOverwriteCurrentResult() {
        queue.enqueue(notification()); var row=worker.claim();
        jdbc.update("UPDATE email_outbox SET lease_token=? WHERE id=?",UUID.randomUUID(),row.id());
        when(sender.deliver(any(),anyString(),anyString(),anyString())).thenReturn("gmail-id");
        worker.deliver(row);
        assertThat(state(row.id())).isEqualTo("SENDING");
    }
}
