package com.internlink.core.application.system;

import com.internlink.core.presentation.system.dto.response.DocumentResponse;
import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;

import java.util.List;
import java.util.UUID;

public interface DocumentService {
    List<DocumentResponse> getDocumentsByContext(ContextType contextType, UUID contextId);

    /** Đọc tài liệu không kiểm tra quyền (chỉ dùng nội bộ service-to-service). */
    DocumentResponse getDocumentById(UUID id);

    /**
     * Đọc tài liệu có kiểm tra quyền truy cập cho người dùng hiện tại.
     * URL nội bộ sẽ bị che nếu người dùng không đủ quyền xem tài liệu đó.
     *
     * @param id            ID của tài liệu cần đọc
     * @param currentUserId ID người dùng đang đăng nhập (lấy từ JWT)
     * @return DocumentResponse với URL đầy đủ nếu đủ quyền, URL bị che nếu không
     */
    DocumentResponse getDocumentByIdForUser(UUID id, UUID currentUserId);

    /** Đăng ký tài liệu qua URL ngoài (legacy). */
    DocumentResponse registerDocument(UUID ownerId, ContextType contextType, UUID contextId,
        DocumentType docType, String originalName, String mimeType, Long sizeBytes, String externalUrl);
}