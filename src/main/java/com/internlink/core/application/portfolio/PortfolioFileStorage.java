package com.internlink.core.application.portfolio;

import com.internlink.core.domain.placement.PortfolioSignedFile;
import com.internlink.core.infrastructure.integration.storage.*;
import com.internlink.core.shared.enums.StorageProvider;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.*;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class PortfolioFileStorage {
    private final StorageServiceRouter router;
    private final ClamAvScanner scanner;
    private final R2StorageService r2;

    public void store(PortfolioSignedFile file, byte[] bytes) {
        scanner.scan(bytes);
        var storage =
                file.getMimeType().startsWith("image/") ? r2 : router.getActiveStorageService();
        if (storage.getProviderType() == StorageProvider.LOCAL) {
            file.setBytes(bytes);
            return;
        }
        var stored =
                storage.store(
                        new BytesMultipartFile(file.getFileName(), file.getMimeType(), bytes),
                        com.internlink.core.application.system.upload.StorageFolders.signed(
                                file.getForm().getPlacement().getId(), file.getForm().getKind()));
        if (TransactionSynchronizationManager.isSynchronizationActive())
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCompletion(int status) {
                            if (status == STATUS_ROLLED_BACK)
                                try {
                                    storage.delete(stored.getProviderFileId());
                                } catch (RuntimeException ignored) {
                                }
                        }
                    });
        file.setBytes(null);
        file.setStorageProvider(stored.getProvider());
        file.setProviderFileId(stored.getProviderFileId());
        file.setProviderFolderId(stored.getProviderFolderId());
        file.setSizeBytes(stored.getSizeBytes());
        file.setChecksum(stored.getChecksum());
    }

    public byte[] read(PortfolioSignedFile file) {
        if (file.getBytes() != null) return file.getBytes();
        try {
            return router.getStorageService(file.getStorageProvider())
                    .loadAsResource(file.getProviderFileId())
                    .getContentAsByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Không tải được bản ký");
        }
    }
}
