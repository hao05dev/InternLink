package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Bộ định tuyến dịch vụ lưu trữ (Storage Service Router).
 * Điều phối các thao tác lưu trữ tệp tin đến đúng nhà cung cấp (Local Disk, Google Drive, ...)
 * dựa trên cấu hình hệ thống hoặc thuộc tính lưu trữ của từng tài liệu.
 */
@Component
public class StorageServiceRouter {

    private final Map<StorageProvider, StorageService> storageServices;
    private final StorageProvider defaultProvider;

    public StorageServiceRouter(
        List<StorageService> services,
        @Value("${internlink.storage.active-provider:LOCAL}") String activeProviderStr
    ) {
        this.storageServices = services.stream()
            .collect(Collectors.toMap(StorageService::getProviderType, Function.identity()));

        StorageProvider resolved;
        try {
            resolved = StorageProvider.valueOf(activeProviderStr.trim().toUpperCase());
        } catch (Exception e) {
            resolved = StorageProvider.LOCAL;
        }
        if (resolved == StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalStateException("STORAGE_PROVIDER=GOOGLE_DRIVE chưa được hỗ trợ; dùng LOCAL để lưu tệp thật");
        }
        this.defaultProvider = resolved;
    }

    /**
     * Lấy dịch vụ lưu trữ mặc định hiện tại dùng cho việc tải lên tệp mới.
     */
    public StorageService getActiveStorageService() {
        return getStorageService(this.defaultProvider);
    }

    /**
     * Lấy dịch vụ lưu trữ theo loại chỉ định cụ thể.
     */
    public StorageService getStorageService(StorageProvider provider) {
        StorageService service = storageServices.get(provider);
        if (service == null) {
            throw new BadRequestException("Không tìm thấy dịch vụ lưu trữ cho nhà cung cấp: " + provider);
        }
        return service;
    }
}
