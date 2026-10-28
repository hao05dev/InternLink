package com.internlink.core.application.system.storage;

import com.internlink.core.domain.system.Document;
import com.internlink.core.domain.system.DocumentCryptoEnvelope;
import com.internlink.core.infrastructure.integration.storage.StorageService;

public interface EncryptedDocumentContentService {

    StoredEncryptedDocument storeEncrypted(
            Document document,
            byte[] plaintextBytes,
            StorageService storageService,
            String subFolder);

    byte[] decryptDocument(
            Document document,
            DocumentCryptoEnvelope envelope,
            StorageService storageService);
}
