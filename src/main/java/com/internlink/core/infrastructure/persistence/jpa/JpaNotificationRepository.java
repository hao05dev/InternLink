package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.system.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;
import java.time.OffsetDateTime;

@Repository
public interface JpaNotificationRepository extends JpaRepository<Notification, UUID> {
    org.springframework.data.domain.Page<Notification> findByRecipientId(UUID recipientId, org.springframework.data.domain.Pageable page);
    org.springframework.data.domain.Page<Notification> findByRecipientIdAndIsReadFalse(UUID recipientId, org.springframework.data.domain.Pageable page);
    List<Notification> findTop50ByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(UUID recipientId);
    long countByRecipientIdAndIsReadFalse(UUID recipientId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient.id = :recipientId AND n.isRead = false")
    void markAllAsRead(@Param("recipientId") UUID recipientId, @Param("readAt") OffsetDateTime readAt);

    default void markAllAsRead(UUID recipientId) {
        markAllAsRead(recipientId, OffsetDateTime.now());
    }
}
