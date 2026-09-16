package com.internlink.core.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    @DisplayName("Lưu file hợp lệ và đọc lại Resource thành công")
    void storeAndLoadFile_Success() {
        FileStorageService service = new FileStorageService(tempDir.toString());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cv_le_hao.pdf",
                "application/pdf",
                "Sample PDF Content".getBytes());

        String storedFileName = service.storeFile(file);

        assertNotNull(storedFileName);
        assertTrue(storedFileName.contains("cv_le_hao.pdf"));

        Resource resource = service.loadFileAsResource(storedFileName);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    @DisplayName("Upload file với định dạng cấm sẽ ném ngoại lệ IllegalArgumentException")
    void storeFile_InvalidExtension_ThrowsException() {
        FileStorageService service = new FileStorageService(tempDir.toString());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "virus.exe",
                "application/octet-stream",
                "Executable content".getBytes());

        assertThrows(IllegalArgumentException.class, () -> service.storeFile(file));
    }
}