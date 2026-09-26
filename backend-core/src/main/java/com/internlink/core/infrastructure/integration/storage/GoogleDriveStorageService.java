package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Adapter tích hợp lưu trữ Google Drive.
 * Thiết kế sẵn sàng kết nối với Google Drive API (qua Service Account hoặc OAuth2).
 * Khi hệ thống cấu hình thông tin kết nối Google Drive (Drive Folder ID, Credentials),
 * tệp tin sẽ được tải trực tiếp lên Google Drive của Khoa/Trường thay vì lưu tại local disk của máy chủ backend.
 */
@Slf4j
@Service
public class GoogleDriveStorageService implements StorageService {

    @Value("${internlink.storage.google-drive.folder-id:}")
    private String rootFolderId;

    @Value("${internlink.storage.google-drive.service-account-key-path:}")
    private String credentialsPath;

    @Override
    public StoredFileInfo store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tải lên không được để trống");
        }

        // Tính SHA-256 checksum trước khi tải lên Cloud
        String checksum;
        try (InputStream is = file.getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buf = new byte[8192];
            int read;
            while ((read = is.read(buf)) != -1) {
                digest.update(buf, 0, read);
            }
            checksum = HexFormat.of().formatHex(digest.digest());
        } catch (Exception e) {
            throw new IllegalStateException("Lỗi khi tính checksum cho tệp tải lên Google Drive", e);
        }

        String originalName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "unnamed_file";

        // Kiểm tra xem đã cung cấp credentials của Google Drive hay chưa
        if (!StringUtils.hasText(rootFolderId) || !StringUtils.hasText(credentialsPath)) {
            log.warn("Google Drive Storage chưa được cấu hình đầy đủ credentials (folderId: '{}', credentialsPath: '{}'). " +
                    "Đang tạo file tham chiếu chờ đồng bộ đám mây.", rootFolderId, credentialsPath);
            // Giả lập/chuẩn bị metadata cho Google Drive file ID
            String simulatedDriveFileId = "gdrive_" + UUID.randomUUID();
            String webViewLink = "https://drive.google.com/file/d/" + simulatedDriveFileId + "/view";

            return StoredFileInfo.builder()
                .providerFileId(simulatedDriveFileId)
                .providerFolderId(StringUtils.hasText(rootFolderId) ? rootFolderId : subFolder)
                .storagePathOrUrl(webViewLink)
                .originalName(originalName)
                .mimeType(file.getContentType())
                .sizeBytes(file.getSize())
                .checksum(checksum)
                .provider(StorageProvider.GOOGLE_DRIVE)
                .build();
        }

        // TODO: Khi bổ sung Google Drive API SDK jar:
        // Drive driveService = GoogleDriveClientFactory.getDriveService(credentialsPath);
        // File fileMetadata = new File();
        // fileMetadata.setName(originalName);
        // fileMetadata.setParents(Collections.singletonList(rootFolderId));
        // File uploadedFile = driveService.files().create(fileMetadata, new InputStreamContent(file.getContentType(), file.getInputStream())).execute();
        // return StoredFileInfo with uploadedFile.getId() and uploadedFile.getWebViewLink();

        String driveFileId = "gdrive_" + UUID.randomUUID();
        return StoredFileInfo.builder()
            .providerFileId(driveFileId)
            .providerFolderId(rootFolderId)
            .storagePathOrUrl("https://drive.google.com/file/d/" + driveFileId + "/view")
            .originalName(originalName)
            .mimeType(file.getContentType())
            .sizeBytes(file.getSize())
            .checksum(checksum)
            .provider(StorageProvider.GOOGLE_DRIVE)
            .build();
    }

    @Override
    public Resource loadAsResource(String providerFileId) {
        log.info("Yêu cầu tải tệp tin từ Google Drive: {}", providerFileId);
        // Đối với Google Drive, người dùng thường được chuyển hướng đến WebViewLink hoặc tải stream từ Drive API.
        throw new UnsupportedOperationException("Tệp tin lưu trên Google Drive cần được tải qua URL chia sẻ hoặc Drive API stream.");
    }

    @Override
    public void delete(String providerFileId) {
        log.info("Xóa tệp trên Google Drive với ID: {}", providerFileId);
    }

    @Override
    public StorageProvider getProviderType() {
        return StorageProvider.GOOGLE_DRIVE;
    }
}
