package com.internlink.core.presentation.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private UUID id;
    private UUID actorUserId;
    private String actorName;
    private String action;
    private String entityType;
    private UUID entityId;
    private String ipAddress;
    private String result;
    private Map<String, Object> changedFields;
    private OffsetDateTime createdAt;
}