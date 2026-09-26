package com.internlink.core.application.system;

import com.internlink.core.presentation.system.dto.response.DocumentDownloadInfo;
import com.internlink.core.presentation.system.dto.response.DocumentResponse;
import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

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

    /**
     * Tải lên tài liệu thực tế (MultipartFile) và lưu qua Storage Provider (Local hoặc Google Drive).
     *
     * @param ownerId     ID của người tải lên
     * @param contextType Ngữ cảnh tài liệu (CV, EVALUATION_REPORT, LOGBOOK, ...)
     * @param contextId   ID đối tượng gắn với ngữ cảnh
     * @param docType     Loại tài liệu
     * @param file        Tệp tin tải lên
     * @return Thông tin tài liệu đã lưu
     */
    DocumentResponse uploadDocument(UUID ownerId, ContextType contextType, UUID contextId,
                                   DocumentType docType, MultipartFile file);

    /**
     * Tải xuống tài liệu an toàn, kiểm tra quyền truy cập của người dùng.
     *
     * @param documentId       ID tài liệu cần tải về
     * @param requestingUserId ID người dùng yêu cầu tải
     * @return Đối tượng chứa Resource và metadata (tên file, mime, size, checksum)
     */
    DocumentDownloadInfo downloadDocument(UUID documentId, UUID requestingUserId);

    /** Đăng ký tài liệu qua URL ngoài (legacy). */
    DocumentResponse registerDocument(UUID ownerId, ContextType contextType, UUID contextId,
        DocumentType docType, String originalName, String mimeType, Long sizeBytes, String externalUrl);
}