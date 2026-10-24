package com.internlink.core.application.organization;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.ReportTemplateVersion;
import com.internlink.core.infrastructure.integration.storage.StorageService;
import com.internlink.core.infrastructure.integration.storage.StorageServiceRouter;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;
import com.internlink.core.infrastructure.persistence.jpa.JpaAcademicProgramRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipTermRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaReportTemplateVersionRepository;
import com.internlink.core.shared.enums.ReportTemplateType;
import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportTemplateServiceTest {

    @Mock
    private JpaReportTemplateVersionRepository templateRepository;
    @Mock
    private JpaInternshipTermRepository termRepository;
    @Mock
    private JpaDepartmentRepository departmentRepository;
    @Mock
    private JpaAcademicProgramRepository programRepository;
    @Mock
    private StorageServiceRouter storageServiceRouter;
    @Mock
    private StorageService storageService;

    private SampleTemplateDocumentGenerator sampleGenerator;
    private ReportTemplateService service;

    @BeforeEach
    void setUp() {
        sampleGenerator = new SampleTemplateDocumentGenerator();
        service = new ReportTemplateService(
            templateRepository,
            termRepository,
            departmentRepository,
            programRepository,
            storageServiceRouter,
            sampleGenerator
        );
    }

    @Test
    void loadTemplateDownload_whenStorageSucceeds_returnsStoredResource() {
        UUID id = UUID.randomUUID();
        ReportTemplateVersion entity = ReportTemplateVersion.builder()
            .title("M-TT-04 KHMT")
            .reportType(ReportTemplateType.M04)
            .fileUrl("r2://bucket/internlink/templates/term1/m04/cs/file1.docx")
            .fileName("M-TT-04.docx")
            .mimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            .build();

        when(templateRepository.findById(id)).thenReturn(Optional.of(entity));
        when(storageServiceRouter.getActiveStorageService()).thenReturn(storageService);
        when(storageService.loadAsResource("internlink/templates/term1/m04/cs/file1.docx"))
            .thenReturn(new ByteArrayResource("test-docx-content".getBytes()));

        TemplateDownload result = service.loadTemplateDownload(id);

        assertThat(result.fileName()).isEqualTo("M-TT-04.docx");
        assertThat(result.mimeType()).contains("wordprocessingml");
        assertThat(result.resource()).isNotNull();
    }

    @Test
    void loadTemplateDownload_whenStorageFails_fallsBackToGeneratedSample() {
        UUID id = UUID.randomUUID();
        ReportTemplateVersion entity = ReportTemplateVersion.builder()
            .title("M-TT-04 Mock")
            .reportType(ReportTemplateType.M04)
            .programCode("CS")
            .fileUrl("/api/v1/storage/documents/sample/M-TT-04.doc")
            .fileName("M-TT-04.doc")
            .mimeType("application/msword")
            .build();

        when(templateRepository.findById(id)).thenReturn(Optional.of(entity));

        TemplateDownload result = service.loadTemplateDownload(id);

        assertThat(result.fileName()).isEqualTo("M-TT-04.doc");
        assertThat(result.resource()).isNotNull();
        verifyNoInteractions(storageServiceRouter);
    }

    @Test
    void generateFallbackDownload_createsOfficialFormattedDoc() {
        TemplateDownload result = service.generateFallbackDownload(ReportTemplateType.M05, "DEFAULT");

        assertThat(result.fileName()).isEqualTo("M-TT-05-Bao_cao_tong_ket_thuc_tap.doc");
        assertThat(result.mimeType()).isEqualTo("application/msword");
        assertThat(result.resource()).isNotNull();
    }

    @Test
    void uploadTemplate_savesCleanR2Key() {
        UUID termId = UUID.randomUUID();
        User admin = User.builder().role(UserRole.FACULTY_ADMIN).build();
        InternshipTerm term = InternshipTerm.builder().build();

        when(termRepository.findById(termId)).thenReturn(Optional.of(term));
        when(storageServiceRouter.getActiveStorageService()).thenReturn(storageService);
        when(storageService.store(any(), anyString())).thenReturn(
            StoredFileInfo.builder()
                .provider(StorageProvider.R2)
                .providerFileId("internlink/templates/" + termId + "/m04/cs/uuid.docx")
                .storagePathOrUrl("r2://bucket/internlink/templates/" + termId + "/m04/cs/uuid.docx")
                .originalName("test.docx")
                .mimeType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                .sizeBytes(1024L)
                .build()
        );
        when(templateRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile file = new MockMultipartFile("file", "test.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "bytes".getBytes());

        service.uploadTemplate(termId, null, null, "CS", ReportTemplateType.M04, "M04 Test", "Desc", true, file, admin);

        verify(templateRepository).save(argThat((ReportTemplateVersion entity) ->
            ("internlink/templates/" + termId + "/m04/cs/uuid.docx").equals(entity.getFileUrl())
        ));
    }
}
