package com.internlink.core.application.system.impl;

import com.internlink.core.application.system.DocumentService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.storage.StorageService;
import com.internlink.core.infrastructure.integration.storage.StorageServiceRouter;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentFoundApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaLearningAgreementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementTaskRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaWeeklyLogbookRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaRubricEvaluationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipCaseRepository;
import com.internlink.core.presentation.system.dto.response.DocumentDownloadInfo;
import com.internlink.core.presentation.system.dto.response.DocumentResponse;
import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.ResourceAuthorization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final JpaDocumentRepository documentRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final StorageServiceRouter storageServiceRouter;
    private final JpaJobApplicationRepository applicationRepository;
    private final JpaStudentFoundApplicationRepository studentFoundApplicationRepository;
    private final JpaLearningAgreementRepository agreementRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaPlacementTaskRepository taskRepository;
    private final JpaWeeklyLogbookRepository logbookRepository;
    private final JpaRubricEvaluationRepository rubricRepository;
    private final JpaInternshipCaseRepository caseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByContext(ContextType contextType, UUID contextId) {
        User actor = currentActor();
        return documentRepository.findByContextTypeAndContextId(contextType, contextId).stream()
            .filter(doc -> canReadDocument(actor, doc))
            .map(doc -> mapToResponse(doc, false)) // context listing: ẩn URL để tránh rò rỉ hàng loạt
            .toList();
    }

    /**
     * Đọc tài liệu không kiểm tra quyền — chỉ dùng nội bộ (service-to-service).
     * Không gọi endpoint này trực tiếp từ Controller công khai.
     */
    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(UUID id) {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        return mapToResponse(doc, true); // nội bộ: luôn trả URL đầy đủ
    }

    /**
     * Đọc tài liệu có kiểm tra quyền: chỉ chủ sở hữu, Admin/Faculty Admin,
     * Lecturer và Company Rep mới được xem URL thực sự.
     * Các vai trò khác nhận metadata nhưng URL bị che (null) để chống rò rỉ liên kết lưu trữ.
     *
     * @param id            ID của tài liệu cần đọc
     * @param currentUserId ID người dùng đang đăng nhập (lấy từ JWT)
     * @return DocumentResponse với URL đầy đủ nếu đủ quyền, URL bị ẩn nếu không
     */
    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentByIdForUser(UUID id, UUID currentUserId) {
        Document doc = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        User actor = currentActor();
        ResourceAuthorization.require(actor.getId().equals(currentUserId) && canReadDocument(actor, doc));

        // Chỉ chủ sở hữu hoặc Admin mới thấy URL lưu trữ thực tế
        boolean canSeeUrl = securityGuard.isSelfOrAdmin(currentUserId, doc.getOwner().getId());
        return mapToResponse(doc, canSeeUrl);
    }

    /**
     * Tải lên tài liệu thực tế và lưu trữ qua Storage Service Provider.
     */
    @Override
    @Transactional
    public DocumentResponse uploadDocument(
        UUID ownerId,
        ContextType contextType,
        UUID contextId,
        DocumentType docType,
        MultipartFile file
    ) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));
        requireUploadAccess(ownerId, contextType, contextId);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tải lên không được rỗng");
        }

        // Lấy Storage Service đang kích hoạt (Local Disk, Google Drive, ...)
        StorageService storageService = storageServiceRouter.getActiveStorageService();
        String subFolder = contextType != null ? contextType.name().toLowerCase() : "misc";

        StoredFileInfo storedInfo = storageService.store(file, subFolder);

        Document doc = Document.builder()
            .owner(owner)
            .contextType(contextType)
            .contextId(contextId)
            .documentType(docType)
            .storageProvider(storedInfo.getProvider())
            .providerFileId(storedInfo.getProviderFileId())
            .providerFolderId(storedInfo.getProviderFolderId())
            .originalName(storedInfo.getOriginalName())
            .mimeType(storedInfo.getMimeType())
            .sizeBytes(storedInfo.getSizeBytes())
            .checksum(storedInfo.getChecksum())
            .externalUrl(storedInfo.getStoragePathOrUrl())
            .visibility("PRIVATE")
            .status("ACTIVE")
            .build();

        Document savedDoc = documentRepository.save(doc);
        log.info("Tải lên tài liệu thành công: id={}, name={}, provider={}", 
            savedDoc.getId(), savedDoc.getOriginalName(), savedDoc.getStorageProvider());

        return mapToResponse(savedDoc, true);
    }

    /**
     * Tải về tài liệu có xác thực quyền hạn.
     */
    @Override
    @Transactional(readOnly = true)
    public DocumentDownloadInfo downloadDocument(UUID documentId, UUID requestingUserId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        User actor = currentActor();
        ResourceAuthorization.require(actor.getId().equals(requestingUserId) && canReadDocument(actor, doc));

        // Định tuyến đến nhà cung cấp lưu trữ đã lưu tài liệu này
        StorageService storageService = storageServiceRouter.getStorageService(doc.getStorageProvider());
        Resource resource = storageService.loadAsResource(doc.getProviderFileId());

        return DocumentDownloadInfo.builder()
            .resource(resource)
            .originalName(doc.getOriginalName())
            .mimeType(doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream")
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
        String externalUrl
    ) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        if (sizeBytes != null && sizeBytes < 0) {
            throw new BadRequestException("Kích thước tài liệu không thể âm");
        }
        if (externalUrl == null || externalUrl.isBlank()) {
            throw new BadRequestException("Đường dẫn tài liệu không được để trống");
        }
        requireUploadAccess(ownerId, contextType, contextId);

        Document doc = Document.builder()
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

    private User currentActor() {
        UUID actorId = securityGuard.currentUser().getId();
        return userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
    }

    private void requireUploadAccess(UUID ownerId, ContextType contextType, UUID contextId) {
        User actor = currentActor();
        ResourceAuthorization.require(actor.getId().equals(ownerId)
            && canAccessContext(actor, contextType, contextId));
    }

    private boolean canReadDocument(User actor, Document document) {
        if (actor.getId().equals(document.getOwner().getId()) || ResourceAuthorization.isAdmin(actor)) {
            return true;
        }
        if (document.getContextType() == ContextType.PROFILE) {
            return document.getDocumentType() == DocumentType.CV
                && applicationRepository.findBySubmittedCvDocumentId(document.getId()).stream()
                    .anyMatch(app -> ResourceAuthorization.canReadApplication(actor, app));
        }
        return canAccessContext(actor, document.getContextType(), document.getContextId());
    }

    private boolean canAccessContext(User actor, ContextType contextType, UUID contextId) {
        if (contextType == null || contextId == null) return false;
        return switch (contextType) {
            case PROFILE -> actor.getId().equals(contextId);
            case APPLICATION -> applicationRepository.findById(contextId)
                .map(app -> ResourceAuthorization.canReadApplication(actor, app)).orElse(false);
            case SELF_FOUND -> studentFoundApplicationRepository.findById(contextId)
                .map(app -> actor.getId().equals(app.getStudent().getId())
                    || ResourceAuthorization.managesDepartment(actor, app.getTerm().getDepartment().getId())
                    || actor.getRole() == com.internlink.core.shared.enums.UserRole.LECTURER
                        && placementRepository.findByStudentFoundApplicationId(app.getId())
                            .map(p -> p.getLecturer().getId().equals(actor.getId())).orElse(false))
                .orElse(false);
            case AGREEMENT -> agreementRepository.findById(contextId)
                .map(agreement -> ResourceAuthorization.canReadAgreement(actor, agreement)).orElse(false);
            case PLACEMENT -> placementRepository.findById(contextId)
                .map(placement -> ResourceAuthorization.canReadPlacement(actor, placement)).orElse(false);
            case TASK -> taskRepository.findById(contextId)
                .map(task -> ResourceAuthorization.canReadPlacement(actor, task.getPlacement())).orElse(false);
            case LOGBOOK -> logbookRepository.findById(contextId)
                .map(logbook -> ResourceAuthorization.canReadPlacement(actor, logbook.getPlacement())).orElse(false);
            case EVALUATION -> rubricRepository.findById(contextId)
                .map(rubric -> ResourceAuthorization.canReadPlacement(actor, rubric.getPlacement())).orElse(false);
            case CASE -> caseRepository.findById(contextId)
                .map(caseFile -> ResourceAuthorization.canReadPlacement(actor, caseFile.getPlacement())).orElse(false);
        };
    }

    /**
     * Ánh xạ Document entity sang DTO response.
     *
     * @param entity    document entity
     * @param exposeUrl nếu false, trường externalUrl sẽ bị ẩn (null) trong response
     *                  để ngăn rò rỉ URL lưu trữ nội bộ cho người không có quyền
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
