package com.internlink.core.application.system.storage.impl;

import com.internlink.core.application.portfolio.BytesMultipartFile;
import com.internlink.core.application.system.storage.EncryptedDocumentContentService;
import com.internlink.core.application.system.storage.StoredEncryptedDocument;
import com.internlink.core.domain.system.Document;
import com.internlink.core.domain.system.DocumentCryptoEnvelope;
import com.internlink.core.infrastructure.integration.storage.StorageService;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;
import com.internlink.core.infrastructure.security.crypto.AadBuilder;
import com.internlink.core.infrastructure.security.crypto.AesGcmDataCipher;
import com.internlink.core.infrastructure.security.crypto.EncryptedDataResult;
import com.internlink.core.infrastructure.security.crypto.KeyEncryptionProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class EncryptedDocumentContentServiceImpl implements EncryptedDocumentContentService {

    private final AesGcmDataCipher cipher;
    private final KeyEncryptionProvider keyEncryptionProvider;
    private final AadBuilder aadBuilder;

    @Override
    public StoredEncryptedDocument storeEncrypted(
            Document document,
            byte[] plaintextBytes,
            StorageService storageService,
            String subFolder) {
        try {
            byte[] aad = aadBuilder.buildAad(
                    1,
                    document.getId(),
                    document.getOwner().getId(),
                    document.getContextType().name(),
                    document.getContextId(),
                    document.getDocumentType().name()
            );

            EncryptedDataResult result = cipher.encrypt(plaintextBytes, aad);
            byte[] wrappedDek = keyEncryptionProvider.wrapKey(result.dek());

            String encFileName = (document.getOriginalName() != null ? document.getOriginalName() : "document") + ".enc";
            BytesMultipartFile encryptedFile = new BytesMultipartFile(
                    encFileName,
                    "application/octet-stream",
                    result.ciphertextWithTag()
            );

            StoredFileInfo storedInfo = storageService.store(encryptedFile, subFolder);

            DocumentCryptoEnvelope envelope = DocumentCryptoEnvelope.builder()
                    .document(document)
                    .formatVersion(1)
                    .dataAlgorithm("AES-256-GCM")
                    .wrapAlgorithm(keyEncryptionProvider.getWrapAlgorithm())
                    .keyId(keyEncryptionProvider.getKeyId())
                    .wrappedDekB64(Base64.getEncoder().encodeToString(wrappedDek))
                    .nonceB64(Base64.getEncoder().encodeToString(result.nonce()))
                    .tagB64(Base64.getEncoder().encodeToString(result.tag()))
                    .aadDigestSha256(aadBuilder.computeDigestSha256(aad))
                    .ciphertextSizeBytes((long) result.ciphertextWithTag().length)
                    .build();

            return new StoredEncryptedDocument(storedInfo, envelope);
        } catch (GeneralSecurityException e) {
            log.error("Lỗi mã hóa tài liệu ID [{}]: {}", document.getId(), e.getMessage());
            throw new IllegalStateException("Không thể mã hóa tệp tin tài liệu", e);
        }
    }

    @Override
    public byte[] decryptDocument(
            Document document,
            DocumentCryptoEnvelope envelope,
            StorageService storageService) {
        try {
            Resource resource = storageService.loadAsResource(document.getProviderFileId());
            byte[] ciphertextWithTag = resource.getContentAsByteArray();

            byte[] aad = aadBuilder.buildAad(
                    envelope.getFormatVersion(),
                    document.getId(),
                    document.getOwner().getId(),
                    document.getContextType().name(),
                    document.getContextId(),
                    document.getDocumentType().name()
            );

            String expectedDigest = aadBuilder.computeDigestSha256(aad);
            if (!expectedDigest.equals(envelope.getAadDigestSha256())) {
                log.error("Xác thực AAD thất bại cho Document ID [{}]. Nghi vấn tráo đổi ngữ cảnh tệp!", document.getId());
                throw new SecurityException("Tính toàn vẹn của tài liệu bị vi phạm (AAD mismatch)");
            }

            byte[] wrappedDek = Base64.getDecoder().decode(envelope.getWrappedDekB64());
            byte[] dek = keyEncryptionProvider.unwrapKey(wrappedDek);
            byte[] nonce = Base64.getDecoder().decode(envelope.getNonceB64());

            return cipher.decrypt(ciphertextWithTag, dek, nonce, aad);
        } catch (IOException | GeneralSecurityException e) {
            log.error("Lỗi giải mã tài liệu ID [{}]: {}", document.getId(), e.getMessage());
            throw new IllegalStateException("Không thể giải mã tệp tin tài liệu", e);
        }
    }
}
