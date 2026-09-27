package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.presentation.system.dto.response.AuditLogResponse;
import com.internlink.core.shared.api.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAllAuditLogs() {
        List<AuditLogResponse> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
