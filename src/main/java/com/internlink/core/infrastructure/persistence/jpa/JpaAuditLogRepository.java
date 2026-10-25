package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.system.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaAuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByActorUserIdOrderByCreatedAtDesc(UUID actorUserId);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);
    List<AuditLog> findByActionInAndCreatedAtAfterOrderByCreatedAtDesc(List<String> actions, OffsetDateTime since);
    List<AuditLog> findByCreatedAtAfterOrderByCreatedAtDesc(OffsetDateTime since);
}
