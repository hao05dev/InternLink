package com.internlink.core.application.system.upload;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.application.system.DocumentService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.storage.*;
import com.internlink.core.infrastructure.persistence.jdbc.UploadTicketRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.shared.enums.*;

import org.junit.jupiter.api.*;
import org.springframework.transaction.support.*;

import java.time.*;
import java.util.*;

class DocumentUploadServiceTest {
    UploadTicketRepository tickets = mock(UploadTicketRepository.class);
    DocumentAccessPolicy access = mock(DocumentAccessPolicy.class);
    ClamAvScanner scanner = mock(ClamAvScanner.class);
    R2StorageService r2 = mock(R2StorageService.class);
    JpaDocumentRepository documents = mock(JpaDocumentRepository.class);
    DocumentService documentService = mock(DocumentService.class);
    User owner = User.builder().role(UserRole.STUDENT).isActive(true).build();
    DocumentUploadService service;
    UploadTicketRepository.Ticket ticket;
    UUID lease = UUID.randomUUID();
    byte[] bytes = "%PDF-1.7 fixture".getBytes();

    @BeforeEach
    void setup() {
        owner.setId(UUID.randomUUID());
        var manager =
                new AbstractPlatformTransactionManager() {
                    protected Object doGetTransaction() {
                        return new Object();
                    }

                    protected void doBegin(
                            Object tx, org.springframework.transaction.TransactionDefinition d) {}

                    protected void doCommit(DefaultTransactionStatus s) {}

                    protected void doRollback(DefaultTransactionStatus s) {}
                };
        service =
                new DocumentUploadService(
                        tickets,
                        access,
                        new DocumentContentValidator(),
                        scanner,
                        r2,
                        new R2StorageProperties(),
                        mock(StorageServiceRouter.class),
                        documents,
                        documentService,
                        manager);
        ticket =
                new UploadTicketRepository.Ticket(
                        UUID.randomUUID(),
                        owner.getId(),
                        ContextType.PROFILE,
                        owner.getId(),
                        DocumentType.CV,
                        "cv.pdf",
                        "application/pdf",
                        bytes.length,
                        R2StorageService.checksum(bytes),
                        "internlink/quarantine/source.pdf",
                        "PENDING",
                        OffsetDateTime.now().plusMinutes(5),
                        null,
                        null);
        when(access.currentActor()).thenReturn(owner);
        when(tickets.get(ticket.id(), owner.getId(), true)).thenReturn(ticket);
        when(tickets.claim(ticket)).thenReturn(lease);
    }

    @Test
    void forgedChecksumCannotCreateDocument() {
        when(r2.verifiedStaging(anyString(), anyLong(), anyString()))
                .thenReturn("%PDF-forged".getBytes());
        assertThatThrownBy(() -> service.finalizeUpload(ticket.id()))
                .hasMessageContaining("Checksum");
        verifyNoInteractions(documents, scanner);
        verify(r2, never()).storeBytes(any(), anyString(), anyString(), anyString());
        verify(tickets).finish(ticket.id(), lease, "REJECTED", "content_rejected", null);
    }

    @Test
    void scanFailureNeverActivatesFile() {
        when(r2.verifiedStaging(anyString(), anyLong(), anyString())).thenReturn(bytes);
        doThrow(new IllegalStateException("scanner offline")).when(scanner).scan(bytes);
        assertThatThrownBy(() -> service.finalizeUpload(ticket.id()))
                .hasMessageContaining("offline");
        verifyNoInteractions(documents);
        verify(tickets).finish(ticket.id(), lease, "PENDING", "verification_unavailable", null);
    }

    @Test
    void validObjectIsActivatedWithANewKeyAndFinalizationIsIdempotent() {
        when(r2.verifiedStaging(anyString(), anyLong(), anyString())).thenReturn(bytes);
        when(tickets.owns(ticket.id(), lease)).thenReturn(true);
        when(r2.storeBytes(any(), anyString(), anyString(), anyString()))
                .thenReturn(
                        StoredFileInfo.builder()
                                .provider(StorageProvider.R2)
                                .providerFileId("internlink/profile/active.pdf")
                                .providerFolderId("private")
                                .originalName("cv.pdf")
                                .mimeType("application/pdf")
                                .sizeBytes((long) bytes.length)
                                .checksum(ticket.checksum())
                                .storagePathOrUrl("r2://private/active")
                                .build());
        UUID id = UUID.randomUUID();
        when(documents.saveAndFlush(any()))
                .thenAnswer(
                        call -> {
                            Document doc = call.getArgument(0);
                            doc.setId(id);
                            assertThat(doc.getProviderFileId()).isNotEqualTo(ticket.key());
                            return doc;
                        });
        service.finalizeUpload(ticket.id());
        verify(tickets).finish(ticket.id(), lease, "COMPLETED", null, id);
        verify(r2).delete(ticket.key());
        var completed =
                new UploadTicketRepository.Ticket(
                        ticket.id(),
                        owner.getId(),
                        ticket.contextType(),
                        ticket.contextId(),
                        ticket.documentType(),
                        ticket.name(),
                        ticket.mime(),
                        ticket.size(),
                        ticket.checksum(),
                        ticket.key(),
                        "COMPLETED",
                        ticket.expires(),
                        null,
                        id);
        when(tickets.get(ticket.id(), owner.getId(), true)).thenReturn(completed);
        clearInvocations(r2, documents);
        service.finalizeUpload(ticket.id());
        verifyNoInteractions(r2, documents);
    }
}
