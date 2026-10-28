package com.internlink.core.infrastructure.persistence.jdbc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.presentation.system.dto.request.ProviderEmailEventRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EmailDeliveryEventStore {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    @Transactional
    public boolean record(ProviderEmailEventRequest event) {
        OffsetDateTime occurredAt = event.occurredAt() == null
                ? OffsetDateTime.now()
                : event.occurredAt();
        String status = event.eventType().toUpperCase();
        String eventJson = json(event, occurredAt);
        String lookup;
        Object identifier;
        if (event.outboxId() != null) {
            lookup = "id=?";
            identifier = event.outboxId();
        } else {
            lookup = "provider_message_id=?";
            identifier = event.providerMessageId();
        }
        var notificationIds =
                jdbc.query(
                        """
UPDATE email_outbox SET status=?,last_error_code=?,last_provider_event_at=?,
    provider_event=CAST(? AS jsonb),
    delivered_at=CASE WHEN ?='DELIVERED' THEN ? ELSE delivered_at END,
    bounced_at=CASE WHEN ?='BOUNCED' THEN ? ELSE bounced_at END
WHERE %s AND status IN ('ACCEPTED','DELIVERED','BOUNCED')
    AND (last_provider_event_at IS NULL OR last_provider_event_at<=?)
RETURNING notification_id
""".formatted(lookup),
                        (rs, index) -> {
                            String value = rs.getString("notification_id");
                            return value == null ? null : UUID.fromString(value);
                        },
                        status,
                        event.errorCode(),
                        occurredAt,
                        eventJson,
                        status,
                        occurredAt,
                        status,
                        occurredAt,
                        identifier,
                        occurredAt);
        notificationIds.stream()
                .filter(java.util.Objects::nonNull)
                .forEach(
                        id ->
                                jdbc.update(
                                        "UPDATE notifications SET delivery_status=delivery_status ||"
                                                + " jsonb_build_object('email',CAST(? AS text)) WHERE id=?",
                                        status,
                                        id));
        return !notificationIds.isEmpty();
    }

    private String json(ProviderEmailEventRequest event, OffsetDateTime occurredAt) {
        try {
            return mapper.writeValueAsString(
                    Map.of(
                            "eventType", event.eventType().toUpperCase(),
                            "occurredAt", occurredAt.toString(),
                            "errorCode", event.errorCode() == null ? "" : event.errorCode(),
                            "metadata", event.metadata() == null ? Map.of() : event.metadata()));
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Payload sự kiện email không hợp lệ", ex);
        }
    }
}
