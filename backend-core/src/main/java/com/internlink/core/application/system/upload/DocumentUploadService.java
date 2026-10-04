package com.internlink.core.application.system.upload;

import com.internlink.core.application.system.DocumentService;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.storage.*;
import com.internlink.core.infrastructure.persistence.jdbc.UploadTicketRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.presentation.system.dto.request.DocumentUploadRequest;
import com.internlink.core.presentation.system.dto.response.*;
import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.*;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DocumentUploadService {
    private final UploadTicketRepository tickets;
    private final DocumentAccessPolicy access;
    private final DocumentContentValidator validator;
    private final ClamAvScanner scanner;
    private final R2StorageService r2;
    private final R2StorageProperties settings;
    private final StorageServiceRouter router;
    private final JpaDocumentRepository documents;
    private final DocumentService documentService;
    private final PlatformTransactionManager transactions;

    public DocumentUploadResponse.Capabilities capabilities() {
        String provider = router.getActiveStorageService().getProviderType().name();
        return new DocumentUploadResponse.Capabilities(
                provider,
                "R2".equals(provider) && settings.isDirectEnabled(),
                settings.getMaxFileBytes(),
                List.copyOf(
                        DocumentContentValidator.MIME.values().stream()
                                .distinct()
                                .sorted()
                                .toList()),
                scanner.enabled());
    }

    public DocumentUploadResponse.Ticket initiate(DocumentUploadRequest request) {
        if (!capabilities().directUpload())
            throw new BadRequestException("Upload trực tiếp R2 chưa bật");
        return new TransactionTemplate(transactions)
                .execute(
                        tx -> {
                            var owner = access.currentActor();
                            access.requireUploadAccess(
                                    owner.getId(), request.contextType(), request.contextId());
                            validator.declared(request.fileName(), request.mimeType());
                            tickets.lockOwner(owner.getId());
                            if (request.sizeBytes() > settings.getMaxFileBytes()
                                    || tickets.pending(owner.getId()) >= 20)
                                throw new BadRequestException("Vượt giới hạn upload đang chờ");
                            UUID id = UUID.randomUUID();
                            String key =
                                    r2.key(
                                            "quarantine/"
                                                    + StorageFolders.document(
                                                            request.contextType(),
                                                            request.contextId(),
                                                            request.documentType(),
                                                            owner.getId()),
                                            request.fileName());
                            OffsetDateTime expires =
                                    OffsetDateTime.now()
                                            .plusSeconds(
                                                    Math.max(
                                                            60,
                                                            Math.min(
                                                                    900,
                                                                    settings
                                                                            .getPresignedSeconds())));
                            String url = r2.presign(key, request.mimeType());
                            tickets.insert(
                                    new UploadTicketRepository.Ticket(
                                            id,
                                            owner.getId(),
                                            request.contextType(),
                                            request.contextId(),
                                            request.documentType(),
                                            request.fileName(),
                                            request.mimeType(),
                                            request.sizeBytes(),
                                            request.checksum(),
                                            key,
                                            "PENDING",
                                            expires,
                                            null,
                                            null));
                            return new DocumentUploadResponse.Ticket(
                                    id, url, Map.of("Content-Type", request.mimeType()), expires);
                        });
    }

    public DocumentResponse finalizeUpload(UUID id) {
        UUID owner = access.currentActor().getId();
        var tx = new TransactionTemplate(transactions);
        var ticket = tx.execute(state -> tickets.get(id, owner, true));
        if (ticket.documentId() != null)
            return documentService.getDocumentByIdForUser(ticket.documentId(), owner);
        UUID lease = tx.execute(state -> tickets.claim(tickets.get(id, owner, true)));
        try {
            byte[] bytes = r2.verifiedStaging(ticket.key(), ticket.size(), ticket.mime());
            if (!ticket.checksum().equals(R2StorageService.checksum(bytes)))
                throw new BadRequestException("Checksum của tệp không khớp");
            validator.validate(ticket.name(), ticket.mime(), bytes);
            scanner.scan(bytes);
            UUID documentId =
                    tx.execute(
                            state -> {
                                if (!tickets.owns(id, lease))
                                    throw new BadRequestException(
                                            "Upload đã hết hạn hoặc mất lượt xử lý");
                                access.requireUploadAccess(
                                        owner, ticket.contextType(), ticket.contextId());
                                // Active object uses a new key; replaying the presigned URL cannot
                                // overwrite it.
                                var stored =
                                        r2.storeBytes(
                                                bytes,
                                                ticket.name(),
                                                ticket.mime(),
                                                StorageFolders.document(
                                                        ticket.contextType(),
                                                        ticket.contextId(),
                                                        ticket.documentType(),
                                                        owner));
                                TransactionSynchronizationManager.registerSynchronization(
                                        new TransactionSynchronization() {
                                            @Override
                                            public void afterCompletion(int status) {
                                                if (status == STATUS_ROLLED_BACK)
                                                    safeDelete(stored.getProviderFileId());
                                            }
                                        });
                                var document =
                                        Document.builder()
                                                .owner(access.currentActor())
                                                .contextType(ticket.contextType())
                                                .contextId(ticket.contextId())
                                                .documentType(ticket.documentType())
                                                .storageProvider(StorageProvider.R2)
                                                .providerFileId(stored.getProviderFileId())
                                                .providerFolderId(stored.getProviderFolderId())
                                                .originalName(stored.getOriginalName())
                                                .mimeType(stored.getMimeType())
                                                .sizeBytes(stored.getSizeBytes())
                                                .checksum(stored.getChecksum())
                                                .externalUrl(stored.getStoragePathOrUrl())
                                                .visibility("PRIVATE")
                                                .status("ACTIVE")
                                                .build();
                                var saved = documents.saveAndFlush(document);
                                tickets.finish(id, lease, "COMPLETED", null, saved.getId());
                                return saved.getId();
                            });
            safeDelete(ticket.key());
            return documentService.getDocumentByIdForUser(documentId, owner);
        } catch (RuntimeException ex) {
            tx.executeWithoutResult(
                    state ->
                            tickets.finish(
                                    id,
                                    lease,
                                    ex instanceof BadRequestException ? "REJECTED" : "PENDING",
                                    ex instanceof BadRequestException
                                            ? "content_rejected"
                                            : "verification_unavailable",
                                    null));
            throw ex;
        }
    }

    private void safeDelete(String key) {
        try {
            r2.delete(key);
        } catch (RuntimeException ignored) {
            /* Maintenance handles expired staging and orphan objects. */
        }
    }
}
