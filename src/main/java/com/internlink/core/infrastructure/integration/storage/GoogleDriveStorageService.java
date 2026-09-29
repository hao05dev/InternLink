package com.internlink.core.infrastructure.integration.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.infrastructure.integration.google.GoogleWorkspaceClient;
import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GoogleDriveStorageService implements StorageService {
    private final GoogleWorkspaceClient google;
    private final ObjectMapper mapper;
    private final String folderId;

    public GoogleDriveStorageService(GoogleWorkspaceClient google, ObjectMapper mapper,
        @Value("${internlink.storage.google-drive.folder-id:}") String folderId) {
        this.google = google;
        this.mapper = mapper;
        this.folderId = folderId;
    }

    @Override
    public StoredFileInfo store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Tệp tải lên không được để trống");
        if (folderId.isBlank()) throw new IllegalStateException("Thiếu GOOGLE_DRIVE_FOLDER_ID");
        try {
            byte[] content = file.getBytes();
            String original = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename().replaceAll("[\\r\\n/]", "_");
            String name = (subFolder == null ? "document" : subFolder.replaceAll("[^a-zA-Z0-9_-]", "_")) + "_" + UUID.randomUUID() + "_" + original;
            String mime = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
            String boundary = "internlink_" + UUID.randomUUID().toString().replace("-", "");
            byte[] prefix = ("--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
                + mapper.writeValueAsString(Map.of("name", name, "parents", List.of(folderId)))
                + "\r\n--" + boundary + "\r\nContent-Type: " + mime + "\r\n\r\n").getBytes(StandardCharsets.UTF_8);
            byte[] suffix = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);
            byte[] body = new byte[prefix.length + content.length + suffix.length];
            System.arraycopy(prefix, 0, body, 0, prefix.length);
            System.arraycopy(content, 0, body, prefix.length, content.length);
            System.arraycopy(suffix, 0, body, prefix.length + content.length, suffix.length);
            JsonNode result = google.json("POST", URI.create("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink"),
                GoogleWorkspaceClient.DRIVE_FILE, null, body, "multipart/related; boundary=" + boundary);
            String id = result.path("id").asText();
            if (id.isBlank()) throw new IllegalStateException("Google Drive không trả về mã tệp");
            String checksum = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
            return StoredFileInfo.builder().provider(StorageProvider.GOOGLE_DRIVE).providerFileId(id)
                .providerFolderId(folderId).storagePathOrUrl(result.path("webViewLink").asText())
                .originalName(original).mimeType(mime).sizeBytes((long) content.length).checksum(checksum).build();
        } catch (Exception error) {
            if (error instanceof RuntimeException runtime) throw runtime;
            throw new IllegalStateException("Không lưu được tệp lên Google Drive", error);
        }
    }

    @Override
    public Resource loadAsResource(String providerFileId) {
        validateId(providerFileId);
        byte[] bytes = google.bytes(URI.create("https://www.googleapis.com/drive/v3/files/" + providerFileId + "?alt=media&supportsAllDrives=true"), GoogleWorkspaceClient.DRIVE_FILE);
        return new ByteArrayResource(bytes);
    }

    @Override
    public void delete(String providerFileId) {
        validateId(providerFileId);
        google.json("DELETE", URI.create("https://www.googleapis.com/drive/v3/files/" + providerFileId + "?supportsAllDrives=true"),
            GoogleWorkspaceClient.DRIVE_FILE, null, null, null);
    }

    @Override
    public StorageProvider getProviderType() { return StorageProvider.GOOGLE_DRIVE; }

    private void validateId(String id) {
        if (id == null || !id.matches("[A-Za-z0-9_-]{10,}")) throw new BadRequestException("Mã tệp Google Drive không hợp lệ");
    }
}
