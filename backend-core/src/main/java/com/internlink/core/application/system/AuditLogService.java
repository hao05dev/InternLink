package com.internlink.core.application.system;

import com.internlink.core.presentation.system.dto.response.AuditLogResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AuditLogService {
    List<AuditLogResponse> getAllLogs();
    void logAction(UUID actorId, String action, String entityType, UUID entityId, String result, Map<String, Object> changedFields, String ipAddress);
}