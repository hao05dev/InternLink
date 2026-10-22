package com.internlink.core.application.system.upload;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.storage.*;
import com.internlink.core.infrastructure.persistence.jdbc.UploadTicketRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.security.SecurityGuard;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class R2MaintenanceService {
    private final R2StorageService r2;
    private final StorageServiceRouter router;
    private final UploadTicketRepository tickets;
    private final JpaDocumentRepository documents;
    private final SecurityGuard guard;
    private final AuditLogService audit;

    public record Page(
            List<R2StorageService.ObjectInfo> items,
            String nextToken,
            List<Map<String, Object>> failures) {}

    public Page preview(String token) {
        guard.requireRole(UserRole.ADMIN);
        requireR2();
        if (token != null && token.length() > 2048)
            throw new BadRequestException("Cursor không hợp lệ");
        var page = r2.list(token);
        return new Page(
                page.items().stream()
                        .filter(
                                o ->
                                        o.modified()
                                                .isBefore(
                                                        Instant.now().minus(Duration.ofHours(24))))
                        .filter(o -> !tickets.referenced(o.key()))
                        .toList(),
                page.nextToken(),
                tickets.failures());
    }

    public void purge(List<String> keys, String reason) {
        guard.requireRole(UserRole.ADMIN);
        requireR2();
        if (keys == null
                || keys.isEmpty()
                || keys.size() > 50
                || reason == null
                || reason.isBlank()
                || reason.length() > 500)
            throw new BadRequestException("Chọn tối đa 50 object và nhập lý do xóa");
        for (String key : new LinkedHashSet<>(keys)) {
            if (tickets.referenced(key)
                    || !r2.modified(key).isBefore(Instant.now().minus(Duration.ofHours(24))))
                throw new BadRequestException("Object đang được sử dụng hoặc còn quá mới");
            audit.logAction(
                    guard.currentUser().getId(),
                    "DELETE_R2_ORPHAN",
                    "R2Object",
                    null,
                    "REQUESTED",
                    Map.of("key", key, "reason", reason),
                    null);
            r2.delete(key);
            audit.logAction(
                    guard.currentUser().getId(),
                    "DELETE_R2_ORPHAN",
                    "R2Object",
                    null,
                    "SUCCESS",
                    Map.of("key", key, "reason", reason),
                    null);
        }
    }

    public void cleanupExpired() {
        if (router.getActiveStorageService().getProviderType() != StorageProvider.R2) return;
        for (String key : tickets.expired())
            try {
                r2.delete(key);
                tickets.expire(key);
            } catch (RuntimeException ignored) {
            }

        try {
            OffsetDateTime threshold = OffsetDateTime.now().minus(Duration.ofHours(24));
            List<Document> pendingDocs = documents.findByStatusAndCreatedAtBefore("PENDING", threshold);
            for (Document doc : pendingDocs) {
                try {
                    if (doc.getProviderFileId() != null) {
                        r2.delete(doc.getProviderFileId());
                    }
                    documents.delete(doc);
                } catch (RuntimeException ignored) {
                }
            }
        } catch (RuntimeException ignored) {
        }
    }

    private void requireR2() {
        if (router.getActiveStorageService().getProviderType() != StorageProvider.R2)
            throw new BadRequestException("Storage hiện tại chưa dùng R2");
    }
}
