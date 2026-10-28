package com.internlink.core.application.system.storage;

import com.internlink.core.domain.system.DocumentCryptoEnvelope;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;

/**
 * Kết quả sau khi mã hóa và lưu trữ tệp nhị phân ciphertext lên Storage Provider.
 */
public record StoredEncryptedDocument(
        StoredFileInfo storedFileInfo,
        DocumentCryptoEnvelope envelope
) {}
