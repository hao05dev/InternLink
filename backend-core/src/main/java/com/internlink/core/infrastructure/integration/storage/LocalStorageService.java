package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageService implements StorageService {

    private final Path rootLocation;

    public LocalStorageService(@Value("${internlink.storage.local.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            log.info("Khởi tạo thư mục lưu trữ cục bộ tại: {}", this.rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Không thể khởi tạo thư mục lưu trữ: " + uploadDir, e);
        }
    }

    @Override
    public StoredFileInfo store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tải lên không được để trống");
        }

        String rawFilename = file.getOriginalFilename();
        String cleanFilename = sanitizeFilename(rawFilename);

        // Sinh tên file lưu trữ duy nhất để tránh xung đột
        String uniqueStoredName = UUID.randomUUID() + "_" + cleanFilename;

        Path targetDir = resolveTargetDirectory(subFolder);
        Path targetPath = targetDir.resolve(uniqueStoredName).normalize();

        // Kiểm tra an toàn: ngăn chặn Path Traversal
        if (!targetPath.startsWith(this.rootLocation)) {
            throw new BadRequestException("Đường dẫn lưu trữ không hợp lệ");
        }

        try (InputStream inputStream = file.getInputStream()) {
            // 1. Tính toán SHA-256 checksum trực tiếp trong quá trình đọc
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;

            // Tạo file đích
            try (var outputStream = Files.newOutputStream(targetPath)) {
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                    outputStream.write(buffer, 0, bytesRead);
                }
            }

            String checksum = HexFormat.of().formatHex(digest.digest());
            String relativeStoredPath = this.rootLocation.relativize(targetPath).toString().replace("\\", "/");

            return StoredFileInfo.builder()
                .providerFileId(relativeStoredPath)
                .providerFolderId(subFolder)
                .storagePathOrUrl(relativeStoredPath)
                .originalName(cleanFilename)
                .mimeType(file.getContentType())
                .sizeBytes(file.getSize())
                .checksum(checksum)
                .provider(StorageProvider.LOCAL)
                .build();

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Không tìm thấy thuật toán băm SHA-256", e);
        } catch (IOException e) {
            log.error("Lỗi khi lưu trữ tệp tin {}", cleanFilename, e);
            throw new IllegalStateException("Thất bại khi ghi tệp tin lên hệ thống lưu trữ", e);
        }
    }

    @Override
    public Resource loadAsResource(String providerFileId) {
        try {
            Path file = this.rootLocation.resolve(providerFileId).normalize();

            // Chống Path Traversal khi đọc
            if (!file.startsWith(this.rootLocation)) {
                throw new BadRequestException("Yêu cầu đọc tệp nằm ngoài thư mục lưu trữ cho phép");
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Tệp tin không tồn tại hoặc không thể đọc: " + providerFileId);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Đường dẫn tệp tin không hợp lệ: " + providerFileId);
        }
    }

    @Override
    public void delete(String providerFileId) {
        try {
            Path file = this.rootLocation.resolve(providerFileId).normalize();
            if (file.startsWith(this.rootLocation)) {
                Files.deleteIfExists(file);
                log.info("Đã xóa tệp: {}", providerFileId);
            }
        } catch (IOException e) {
            log.warn("Không thể xóa tệp: {}", providerFileId, e);
        }
    }

    @Override
    public StorageProvider getProviderType() {
        return StorageProvider.LOCAL;
    }

    private Path resolveTargetDirectory(String subFolder) {
        String cleanSubFolder = StringUtils.hasText(subFolder) ? sanitizeFolder(subFolder) : "general";
        Path target = this.rootLocation.resolve(cleanSubFolder).normalize();
        try {
            Files.createDirectories(target);
            return target;
        } catch (IOException e) {
            throw new IllegalStateException("Không thể tạo thư mục lưu trữ: " + target, e);
        }
    }

    private String sanitizeFilename(String filename) {
        if (!StringUtils.hasText(filename)) {
            return "unnamed_file";
        }
        // Loại bỏ đường dẫn và chỉ giữ lại tên file
        String clean = Paths.get(filename).getFileName().toString();
        // Thay thế ký tự nguy hiểm bằng dấu gạch dưới
        return clean.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sanitizeFolder(String folder) {
        return folder.replaceAll("[^a-zA-Z0-9_-]", "_");
    }
}
