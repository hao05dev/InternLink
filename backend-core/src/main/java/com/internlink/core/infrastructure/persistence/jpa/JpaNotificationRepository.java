package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.system.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;



@Repository
public interface JpaNotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(UUID recipientId);
    long countByRecipientIdAndIsReadFalse(UUID recipientId);
}
