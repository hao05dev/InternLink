package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/** Không nhận tệp khi chưa có tích hợp Drive thật, tránh lưu metadata giả. */
@Service
public class GoogleDriveStorageService implements StorageService {
    @Override
    public StoredFileInfo store(MultipartFile file, String subFolder) {
        throw new UnsupportedOperationException("Google Drive chưa được tích hợp; hãy dùng STORAGE_PROVIDER=LOCAL");
    }

    @Override
    public Resource loadAsResource(String providerFileId) {
        throw new UnsupportedOperationException("Không thể tải tệp từ Google Drive khi chưa tích hợp Drive API");
    }

    @Override
    public void delete(String providerFileId) {
        throw new UnsupportedOperationException("Không thể xóa tệp từ Google Drive khi chưa tích hợp Drive API");
    }

    @Override
    public StorageProvider getProviderType() {
        return StorageProvider.GOOGLE_DRIVE;
    }
}
