package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.DocumentService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.system.dto.response.DocumentDownloadInfo;
import com.internlink.core.presentation.system.dto.response.DocumentResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Tải lên tài liệu thực tế (MultipartFile).
     * Được lưu trữ qua Storage Provider (Local hoặc Google Drive tùy cấu hình).
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @RequestParam ContextType contextType,
        @RequestParam UUID contextId,
        @RequestParam DocumentType docType,
        @RequestPart("file") MultipartFile file
    ) {
        DocumentResponse response = documentService.uploadDocument(
            userDetail.getId(), contextType, contextId, docType, file
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Tải lên tài liệu thành công", response));
    }

    /**
     * Tải xuống tài liệu an toàn.
     * Kiểm tra quyền truy cập (chỉ chủ sở hữu hoặc người có thẩm quyền mới được tải).
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadDocument(
        @PathVariable UUID id,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        DocumentDownloadInfo downloadInfo = documentService.downloadDocument(id, userDetail.getId());

        String encodedFilename = URLEncoder.encode(downloadInfo.getOriginalName(), StandardCharsets.UTF_8)
            .replace("+", "%20");

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(downloadInfo.getMimeType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFilename + "\"; filename*=UTF-8''" + encodedFilename)
            .header("X-Checksum-SHA256", downloadInfo.getChecksum())
            .body(downloadInfo.getResource());
    }

    /**
     * Danh sách tài liệu theo ngữ cảnh — URL lưu trữ bị ẩn trong listing,
     * dùng GET /documents/{id} để lấy URL đầy đủ sau khi kiểm tra quyền.
     */
    @GetMapping("/context")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocumentsByContext(
        @RequestParam ContextType contextType,
        @RequestParam UUID contextId
    ) {
        List<DocumentResponse> list = documentService.getDocumentsByContext(contextType, contextId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Lấy thông tin và URL tài liệu — có kiểm tra quyền theo từng hồ sơ.
     * Chủ sở hữu và Admin/Faculty Admin nhận URL đầy đủ;
     * Lecturer/Company Rep nhận metadata (URL bị ẩn);
     * Vai trò khác bị từ chối (403).
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentById(
        @PathVariable UUID id,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        DocumentResponse response = documentService.getDocumentByIdForUser(id, userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Đăng ký tài liệu qua URL ngoài.
     * Người đăng ký phải là chính chủ — owner gắn với user đang đăng nhập.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DocumentResponse>> registerDocument(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @RequestParam ContextType contextType,
        @RequestParam UUID contextId,
        @RequestParam DocumentType docType,
        @RequestParam String originalName,
        @RequestParam(required = false) String mimeType,
        @RequestParam(required = false) Long sizeBytes,
        @RequestParam String externalUrl
    ) {
        DocumentResponse response = documentService.registerDocument(
            userDetail.getId(), contextType, contextId, docType, originalName, mimeType, sizeBytes, externalUrl
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Đăng ký tài liệu thành công", response));
    }
}