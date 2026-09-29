package com.internlink.core.application.system.impl;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.AuditLog;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuditLogRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.system.dto.response.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final JpaAuditLogRepository auditLogRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public void logAction(
        UUID actorId,
        String action,
        String entityType,
        UUID entityId,
        String result,
        Map<String, Object> changedFields,
        String ipAddress
    ) {
        User actor = (actorId != null) ? userRepository.findById(actorId).orElse(null) : null;

        AuditLog log = AuditLog.builder()
            .actorUser(actor)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .result(result)
            .changedFields(changedFields != null ? changedFields : Map.of())
            .ipAddress(ipAddress)
            .build();

        auditLogRepository.save(log);
    }

    private AuditLogResponse mapToResponse(AuditLog entity) {
        return AuditLogResponse.builder()
            .id(entity.getId())
            .actorUserId(entity.getActorUser() != null ? entity.getActorUser().getId() : null)
            .actorName(entity.getActorUser() != null ? entity.getActorUser().getFullName() : "SYSTEM")
            .action(entity.getAction())
            .entityType(entity.getEntityType())
            .entityId(entity.getEntityId())
            .ipAddress(entity.getIpAddress())
            .result(entity.getResult())
            .changedFields(entity.getChangedFields())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
