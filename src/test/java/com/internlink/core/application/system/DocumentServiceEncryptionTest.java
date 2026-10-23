package com.internlink.core.application.system;

import com.internlink.core.application.system.impl.DocumentServiceImpl;
import com.internlink.core.application.system.storage.EncryptedDocumentContentService;
import com.internlink.core.application.system.storage.StoredEncryptedDocument;
import com.internlink.core.application.system.upload.DocumentAccessPolicy;
import com.internlink.core.application.system.upload.DocumentContentValidator;
import com.internlink.core.application.system.upload.DocumentEncryptionPolicy;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.domain.system.DocumentCryptoEnvelope;
import com.internlink.core.infrastructure.integration.storage.ClamAvScanner;
import com.internlink.core.infrastructure.integration.storage.StorageService;
import com.internlink.core.infrastructure.integration.storage.StorageServiceRouter;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentCryptoEnvelopeRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.presentation.system.dto.response.DocumentDownloadInfo;
import com.internlink.core.presentation.system.dto.response.DocumentResponse;
import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.StorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class DocumentServiceEncryptionTest {

    private JpaDocumentRepository documentRepository;
    private JpaDocumentCryptoEnvelopeRepository cryptoEnvelopeRepository;
    private StorageServiceRouter storageServiceRouter;
    private DocumentAccessPolicy access;
    private DocumentContentValidator content;
    private ClamAvScanner scanner;
    private StorageService r2StorageService;
    private EncryptedDocumentContentService encryptedContentService;

    private DocumentEncryptionPolicy encryptionPolicy;
    private DocumentServiceImpl documentService;

    private User owner;
    private UUID ownerId;
    private UUID docId;

    @BeforeEach
    void setUp() {
        documentRepository = mock(JpaDocumentRepository.class);
        cryptoEnvelopeRepository = mock(JpaDocumentCryptoEnvelopeRepository.class);
        storageServiceRouter = mock(StorageServiceRouter.class);
        access = mock(DocumentAccessPolicy.class);
        content = mock(DocumentContentValidator.class);
        scanner = mock(ClamAvScanner.class);
        r2StorageService = mock(StorageService.class);
        encryptedContentService = mock(EncryptedDocumentContentService.class);

        encryptionPolicy = new DocumentEncryptionPolicy();
        documentService = new DocumentServiceImpl(
                documentRepository,
                cryptoEnvelopeRepository,
                storageServiceRouter,
                access,
                content,
                scanner,
                encryptionPolicy,
                encryptedContentService
        );

        ownerId = UUID.randomUUID();
        docId = UUID.randomUUID();
        owner = User.builder().fullName("Nguyễn Văn A").build();
        owner.setId(ownerId);
    }

    @Test
    @DisplayName("Upload AGREEMENT phải tự động kích hoạt mã hóa lai và lưu envelope")
    void shouldEncryptAgreementOnUpload() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "agreement.pdf", "application/pdf", "Plaintext Agreement Content".getBytes(StandardCharsets.UTF_8));

        when(access.currentActor()).thenReturn(owner);
        when(storageServiceRouter.getStorageService(StorageProvider.R2)).thenReturn(r2StorageService);
        when(r2StorageService.getProviderType()).thenReturn(StorageProvider.R2);

        Document pendingDoc = Document.builder()
                .owner(owner)
                .contextType(ContextType.APPLICATION)
                .contextId(UUID.randomUUID())
                .documentType(DocumentType.AGREEMENT)
                .storageProvider(StorageProvider.R2)
                .originalName("agreement.pdf")
                .status("UPLOADING")
                .build();
        pendingDoc.setId(docId);

        when(documentRepository.save(any(Document.class))).thenReturn(pendingDoc);

        StoredFileInfo storedInfo = StoredFileInfo.builder()
                .provider(StorageProvider.R2)
                .providerFileId("enc_file_key_123")
                .checksum("checksum_enc")
                .storagePathOrUrl("https://r2.internlink/enc_file_key_123")
                .build();
        DocumentCryptoEnvelope envelope = DocumentCryptoEnvelope.builder()
                .document(pendingDoc)
                .keyId("master-key-v1")
                .build();

        when(encryptedContentService.storeEncrypted(any(Document.class), any(), eq(r2StorageService), any()))
                .thenReturn(new StoredEncryptedDocument(storedInfo, envelope));

        DocumentResponse response = documentService.uploadDocument(
                ownerId, ContextType.APPLICATION, UUID.randomUUID(), DocumentType.AGREEMENT, file);

        assertThat(response).isNotNull();
        verify(encryptedContentService, times(1)).storeEncrypted(any(Document.class), any(), eq(r2StorageService), any());
        verify(cryptoEnvelopeRepository, times(1)).save(envelope);
    }

    @Test
    @DisplayName("Download tài liệu đã mã hóa phải giải mã thành công thành Plaintext Resource")
    void shouldDecryptOnDownloadWhenEnvelopeExists() {
        Document doc = Document.builder()
                .owner(owner)
                .contextType(ContextType.APPLICATION)
                .contextId(UUID.randomUUID())
                .documentType(DocumentType.AGREEMENT)
                .storageProvider(StorageProvider.R2)
                .providerFileId("enc_file_key_123")
                .originalName("agreement.pdf")
                .status("ACTIVE")
                .build();
        doc.setId(docId);

        DocumentCryptoEnvelope envelope = DocumentCryptoEnvelope.builder()
                .document(doc)
                .keyId("master-key-v1")
                .build();

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(access.currentActor()).thenReturn(owner);
        when(access.canReadDocument(owner, doc)).thenReturn(true);
        when(storageServiceRouter.getStorageService(StorageProvider.R2)).thenReturn(r2StorageService);
        when(cryptoEnvelopeRepository.findByDocumentId(docId)).thenReturn(Optional.of(envelope));

        byte[] plainBytes = "Plaintext Content".getBytes(StandardCharsets.UTF_8);
        when(encryptedContentService.decryptDocument(doc, envelope, r2StorageService)).thenReturn(plainBytes);

        DocumentDownloadInfo downloadInfo = documentService.downloadDocument(docId, ownerId);

        assertThat(downloadInfo).isNotNull();
        assertThat(downloadInfo.getResource()).isInstanceOf(ByteArrayResource.class);
        verify(encryptedContentService, times(1)).decryptDocument(doc, envelope, r2StorageService);
    }
}
