package com.internlink.core.application.system.impl;

import com.internlink.core.application.system.DocumentService;
import com.internlink.core.application.system.storage.EncryptedDocumentContentService;
import com.internlink.core.application.system.storage.StoredEncryptedDocument;
import com.internlink.core.application.system.upload.DocumentAccessPolicy;
import com.internlink.core.application.system.upload.DocumentContentValidator;
import com.internlink.core.application.system.upload.DocumentEncryptionPolicy;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.domain.system.DocumentCryptoEnvelope;
import com.internlink.core.infrastructure.integration.storage.ClamAvScanner;
import com.internlink.core.infrastructure.integration.storage.StorageService;
import com.internlink.core.infrastructure.integration.storage.StorageServiceRouter;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentCryptoEnvelopeRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.presentation.system.dto.response.DocumentDownloadInfo;
import com.internlink.core.presentation.system.dto.response.DocumentResponse;
import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final JpaDocumentRepository documentRepository;
    private final JpaDocumentCryptoEnvelopeRepository cryptoEnvelopeRepository;
    private final StorageServiceRouter storageServiceRouter;
    private final DocumentAccessPolicy access;
    private final DocumentContentValidator content;
    private final ClamAvScanner scanner;
    private final DocumentEncryptionPolicy encryptionPolicy;
    private final EncryptedDocumentContentService encryptedContentService;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByContext(ContextType contextType, UUID contextId) {
        User actor = access.currentActor();
        return documentRepository.findByContextTypeAndContextId(contextType, contextId).stream()
                .filter(doc -> !"DELETED".equals(doc.getStatus()) && doc.getDeletedAt() == null)
                .filter(doc -> access.canReadDocument(actor, doc))
                .map(
                        doc ->
                                mapToResponse(
                                        doc,
                                        false)) // context listing: ẩn URL để tránh rò rỉ hàng loạt
                .toList();
    }

    /**
     * Đọc tài liệu không kiểm tra quyền — chỉ dùng nội bộ (service-to-service). Không gọi endpoint
     * này trực tiếp từ Controller công khai.
     */
    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(UUID id) {
        Document doc =
                documentRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        return mapToResponse(doc, true); // nội bộ: luôn trả URL đầy đủ
    }

    /**
     * Đọc tài liệu có kiểm tra quyền: chỉ chủ sở hữu, Admin/Faculty Admin, Lecturer và Company Rep
     * mới được xem URL thực sự. Các vai trò khác nhận metadata nhưng URL bị che (null) để chống rò
     * rỉ liên kết lưu trữ.
     *
     * @param id ID của tài liệu cần đọc
     * @param currentUserId ID người dùng đang đăng nhập (lấy từ JWT)
     * @return DocumentResponse với URL đầy đủ nếu đủ quyền, URL bị ẩn nếu không
     */
    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentByIdForUser(UUID id, UUID currentUserId) {
        Document doc =
                documentRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        User actor = access.currentActor();
        ResourceAuthorization.require(
                actor.getId().equals(currentUserId) && access.canReadDocument(actor, doc));

        // Chỉ chủ sở hữu hoặc Admin mới thấy URL lưu trữ thực tế
        boolean canSeeUrl =
                currentUserId.equals(doc.getOwner().getId())
                        || ResourceAuthorization.isAdmin(actor);
        return mapToResponse(doc, canSeeUrl);
    }

    /** Tải lên tài liệu thực tế và lưu trữ qua Storage Service Provider. */
    @Override
    @Transactional
    public DocumentResponse uploadDocument(
            UUID ownerId,
            ContextType contextType,
            UUID contextId,
            DocumentType docType,
            MultipartFile file) {
        User owner =
                java.util.Optional.of(access.currentActor())
                        .filter(user -> user.getId().equals(ownerId))
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));
        access.requireUploadAccess(ownerId, contextType, contextId);

        if (file == null || file.isEmpty() || file.getSize() > 20L * 1024 * 1024) {
            throw new BadRequestException("Tệp tải lên phải có dung lượng từ 1 byte đến 20 MiB");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
            content.validate(file.getOriginalFilename(), file.getContentType(), bytes);
            scanner.scan(bytes);
        } catch (IOException ex) {
            throw new BadRequestException("Không đọc được tệp");
        }

        boolean shouldEncrypt = encryptionPolicy.shouldEncrypt(docType, contextType);
        StorageService storageService = shouldEncrypt
                ? storageServiceRouter.getStorageService(StorageProvider.R2)
                : (file.getContentType() != null && file.getContentType().startsWith("image/")
                        ? storageServiceRouter.getStorageService(StorageProvider.R2)
                        : storageServiceRouter.getActiveStorageService());

        String subFolder = com.internlink.core.application.system.upload.StorageFolders.document(
                contextType, contextId, docType, ownerId);

        Document doc = Document.builder()
                .owner(owner)
                .contextType(contextType)
                .contextId(contextId)
                .documentType(docType)
                .storageProvider(storageService.getProviderType())
                .originalName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .sizeBytes(file.getSize())
                .visibility("PRIVATE")
                .status("UPLOADING")
                .build();

        Document savedDoc = documentRepository.save(doc);
        StoredFileInfo storedInfo;

        if (shouldEncrypt) {
            StoredEncryptedDocument encResult =
                    encryptedContentService.storeEncrypted(savedDoc, bytes, storageService, subFolder);
            storedInfo = encResult.storedFileInfo();
            cryptoEnvelopeRepository.save(encResult.envelope());
        } else {
            storedInfo = storageService.store(file, subFolder);
        }

        savedDoc.setProviderFileId(storedInfo.getProviderFileId());
        savedDoc.setProviderFolderId(storedInfo.getProviderFolderId());
        savedDoc.setChecksum(storedInfo.getChecksum());
        savedDoc.setExternalUrl(storedInfo.getStoragePathOrUrl());
        savedDoc.setStatus("ACTIVE");

        registerRollbackCleanup(storageService, storedInfo.getProviderFileId());

        try {
            savedDoc = documentRepository.save(savedDoc);
        } catch (RuntimeException ex) {
            cleanupStoredFile(storageService, storedInfo.getProviderFileId());
            throw ex;
        }

        if (contextType == ContextType.PROFILE && docType == DocumentType.CV) {
            List<Document> oldCvs = documentRepository.findByContextTypeAndContextId(contextType, contextId);
            for (Document oldCv : oldCvs) {
                if (oldCv.getDocumentType() == DocumentType.CV && !oldCv.getId().equals(savedDoc.getId()) && !"DELETED".equals(oldCv.getStatus())) {
                    oldCv.setStatus("DELETED");
                    oldCv.setDeletedAt(java.time.OffsetDateTime.now());
                    documentRepository.save(oldCv);
                }
            }
        }

        log.info(
                "Tải lên tài liệu thành công: id={}, name={}, encrypted={}",
                savedDoc.getId(),
                savedDoc.getOriginalName(),
                shouldEncrypt);

        return mapToResponse(savedDoc, true);
    }

    private void registerRollbackCleanup(StorageService storageService, String key) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCompletion(int status) {
                            if (status == STATUS_ROLLED_BACK) {
                                cleanupStoredFile(storageService, key);
                            }
                        }
                    });
        }
    }

    private void cleanupStoredFile(StorageService storageService, String key) {
        try {
            storageService.delete(key);
        } catch (RuntimeException ex) {
            log.warn(
                    "Storage cleanup failed after document rollback ({})",
                    storageService.getProviderType());
        }
    }

    /** Tải về tài liệu có xác thực quyền hạn. */
    @Override
    @Transactional(readOnly = true)
    public DocumentDownloadInfo downloadDocument(UUID documentId, UUID requestingUserId) {
        Document doc =
                documentRepository
                        .findById(documentId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Document", "id", documentId));
        User actor = access.currentActor();
        ResourceAuthorization.require(
                actor.getId().equals(requestingUserId) && access.canReadDocument(actor, doc));

        StorageService storageService =
                storageServiceRouter.getStorageService(doc.getStorageProvider());

        Optional<DocumentCryptoEnvelope> envelopeOpt =
                cryptoEnvelopeRepository.findByDocumentId(documentId);
        Resource resource;
        if (envelopeOpt.isPresent()) {
            byte[] decrypted = encryptedContentService.decryptDocument(doc, envelopeOpt.get(), storageService);
            resource = new ByteArrayResource(decrypted);
        } else {
            resource = storageService.loadAsResource(doc.getProviderFileId());
        }

        return DocumentDownloadInfo.builder()
                .resource(resource)
                .originalName(doc.getOriginalName())
                .mimeType(
                        doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream")
                .sizeBytes(doc.getSizeBytes())
                .checksum(doc.getChecksum())
                .build();
    }

    @Override
    @Transactional
    public DocumentResponse registerDocument(
            UUID ownerId,
            ContextType contextType,
            UUID contextId,
            DocumentType docType,
            String originalName,
            String mimeType,
            Long sizeBytes,
            String externalUrl) {
        User owner =
                java.util.Optional.of(access.currentActor())
                        .filter(user -> user.getId().equals(ownerId))
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        if (sizeBytes != null && sizeBytes < 0) {
            throw new BadRequestException("Kích thước tài liệu không thể âm");
        }
        if (externalUrl == null || externalUrl.isBlank()) {
            throw new BadRequestException("Đường dẫn tài liệu không được để trống");
        }
        access.requireUploadAccess(ownerId, contextType, contextId);

        Document doc =
                Document.builder()
                        .owner(owner)
                        .contextType(contextType)
                        .contextId(contextId)
                        .documentType(docType)
                        .storageProvider(StorageProvider.LOCAL)
                        .originalName(originalName)
                        .mimeType(mimeType)
                        .sizeBytes(sizeBytes)
                        .externalUrl(externalUrl)
                        .visibility("PRIVATE")
                        .status("ACTIVE")
                        .build();

        return mapToResponse(documentRepository.save(doc), true);
    }

    /**
     * Ánh xạ Document entity sang DTO response.
     *
     * @param entity document entity
     * @param exposeUrl nếu false, trường externalUrl sẽ bị ẩn (null) trong response để ngăn rò rỉ
     *     URL lưu trữ nội bộ cho người không có quyền
     */
    private DocumentResponse mapToResponse(Document entity, boolean exposeUrl) {
        return DocumentResponse.builder()
                .id(entity.getId())
                .ownerUserId(entity.getOwner().getId())
                .ownerName(entity.getOwner().getFullName())
                .contextType(entity.getContextType())
                .contextId(entity.getContextId())
                .documentType(entity.getDocumentType())
                .storageProvider(entity.getStorageProvider())
                .originalName(entity.getOriginalName())
                .mimeType(entity.getMimeType())
                .sizeBytes(entity.getSizeBytes())
                .externalUrl(exposeUrl ? entity.getExternalUrl() : null)
                .visibility(entity.getVisibility())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
