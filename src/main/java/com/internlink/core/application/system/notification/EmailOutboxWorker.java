package com.internlink.core.application.system.notification;

import com.internlink.core.domain.system.NotificationPreference;
import com.internlink.core.infrastructure.integration.email.*;
import com.internlink.core.infrastructure.integration.google.GmailSender;
import com.internlink.core.infrastructure.persistence.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.OffsetDateTime;
import java.util.*;

@Component @RequiredArgsConstructor @Slf4j
@ConditionalOnProperty(name="internlink.email.enabled",havingValue="true")
public class EmailOutboxWorker {
    private final JdbcTemplate jdbc;
    private final PlatformTransactionManager transactions;
    private final GmailSender sender;
    private final EmailProperties settings;
    private final JpaNotificationPreferenceRepository preferences;
    private final JpaUserRepository users;
    public record Delivery(UUID id, UUID notificationId, UUID userId, String email, String subject,
                           String body, String type, int attempts, UUID lease) {}

    @Scheduled(fixedDelayString="${internlink.email.poll-interval-ms:15000}")
    public void tick() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            List<UUID> expired = jdbc.query("UPDATE email_outbox SET status='UNKNOWN',last_error_code='worker_result_unknown',lease_token=NULL,lease_until=NULL WHERE status='SENDING' AND lease_until<CURRENT_TIMESTAMP RETURNING notification_id",
                (rs,index) -> uuid(rs.getString("notification_id")));
            for (UUID notificationId : expired) if (notificationId != null)
                jdbc.update("UPDATE notifications SET delivery_status = delivery_status || '{\"email\":\"UNKNOWN\"}'::jsonb WHERE id=?", notificationId);
        });
        for (int count=0;count<10;count++) {
            Delivery row = claim();
            if (row==null) break;
            deliver(row);
        }
    }
    Delivery claim() {
        return new TransactionTemplate(transactions).execute(status -> {
            UUID lease=UUID.randomUUID();
            List<Delivery> claimed = jdbc.query("""
                UPDATE email_outbox SET status='SENDING',attempts=attempts+1,lease_token=?,
                    lease_until=CURRENT_TIMESTAMP + INTERVAL '10 minutes'
                WHERE id IN (SELECT id FROM email_outbox WHERE status IN ('PENDING','RETRY')
                    AND next_attempt_at<=CURRENT_TIMESTAMP ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED)
                RETURNING *
                """, (rs,index) -> new Delivery(UUID.fromString(rs.getString("id")),uuid(rs.getString("notification_id")),
                    uuid(rs.getString("recipient_user_id")),rs.getString("recipient_email"),rs.getString("subject"),
                    rs.getString("body"),rs.getString("event_type"),rs.getInt("attempts"),lease), lease);
            return claimed.isEmpty() ? null : claimed.getFirst();
        });
    }
    void deliver(Delivery row) {
        if (row.userId()!=null) {
            boolean allowed = Boolean.TRUE.equals(new TransactionTemplate(transactions).execute(status -> {
                var user=users.findById(row.userId());
                if (user.isEmpty() || !Boolean.TRUE.equals(user.get().getIsActive())
                    || !row.email().equalsIgnoreCase(user.get().getEmail())) return false;
                var preference=preferences.findById(row.userId()).orElseGet(() -> NotificationPreference.builder().build());
                return NotificationPolicy.wantsEmail(preference,row.type());
            }));
            if (!allowed) { finish(row,"SKIPPED","email_preference_or_recipient_changed",null); return; }
        }
        try {
            String providerId=sender.deliver(row.id(),row.email(),row.subject(),row.body());
            finish(row,"SENT",null,providerId);
        } catch (EmailDeliveryException ex) {
            String result=ex.ambiguous() ? "UNKNOWN"
                : ex.retryable() && row.attempts()<settings.getMaxAttempts() ? "RETRY" : "FAILED";
            finish(row,result,ex.code(),null);
        } catch (RuntimeException ex) {
            finish(row,"UNKNOWN","delivery_result_unknown",null);
        }
    }
    private void finish(Delivery row,String result,String error,String providerId) {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            OffsetDateTime next=OffsetDateTime.now().plusSeconds(Math.min(3600,30L << Math.min(row.attempts(),6)));
            int updated=jdbc.update("""
                UPDATE email_outbox SET status=?,last_error_code=?,provider_message_id=?,next_attempt_at=?,
                    sent_at=CASE WHEN ?='SENT' THEN CURRENT_TIMESTAMP ELSE sent_at END,lease_token=NULL,lease_until=NULL
                WHERE id=? AND status='SENDING' AND lease_token=?
                """,result,error,providerId,next,result,row.id(),row.lease());
            if (updated>0 && row.notificationId()!=null)
                jdbc.update("UPDATE notifications SET delivery_status=delivery_status || jsonb_build_object('email',CAST(? AS text)) WHERE id=?",
                    result,row.notificationId());
        });
        if (Set.of("FAILED","UNKNOWN").contains(result)) log.warn("Email delivery {} ended as {} ({})",row.id(),result,error);
    }
    private static UUID uuid(String value) { return value==null ? null : UUID.fromString(value); }
}
