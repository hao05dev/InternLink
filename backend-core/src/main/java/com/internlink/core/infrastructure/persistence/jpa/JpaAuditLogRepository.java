package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.system.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;



@Repository
public interface JpaAuditLogRepository extends JpaRepository<AuditLog, UUID> {
    java.util.List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByActorUserIdOrderByCreatedAtDesc(UUID actorUserId);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);
}
