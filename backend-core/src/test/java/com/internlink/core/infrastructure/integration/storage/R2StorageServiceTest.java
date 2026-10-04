package com.internlink.core.infrastructure.integration.storage;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;

import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.AbortableInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.*;
import java.nio.charset.StandardCharsets;

class R2StorageServiceTest {
    R2StorageProperties settings;
    S3Client client;
    R2StorageService storage;

    @BeforeEach
    void setup() {
        settings = new R2StorageProperties();
        settings.setBucket("private-documents");
        client = mock(S3Client.class);
        storage = new R2StorageService(settings, client);
    }

    @Test
    void preservesStructuredFoldersButRejectsTraversal() {
        String key =
                storage.key("media/recruitment/companies/company-id/banners/2026/10", "Poster.png");
        assertThat(key)
                .matches(
                        "internlink/media/recruitment/companies/company-id/banners/2026/10/[a-f0-9-]+[.]png");
        for (String folder :
                new String[] {
                    "../images", "media/../../private", "/media", "media//images", "media/images/"
                })
            assertThatThrownBy(() -> storage.key(folder, "a.png"))
                    .isInstanceOf(BadRequestException.class);
    }

    @Test
    void privateUploadUsesOpaqueKeyAndIntegrityMetadata() throws Exception {
        var stored =
                storage.store(
                        new MockMultipartFile(
                                "file",
                                "../../hồ sơ.PDF",
                                "application/pdf",
                                "abc".getBytes(StandardCharsets.UTF_8)),
                        "CV");
        var request = ArgumentCaptor.forClass(PutObjectRequest.class);
        var body = ArgumentCaptor.forClass(RequestBody.class);
        verify(client).putObject(request.capture(), body.capture());
        assertThat(stored.getProvider()).isEqualTo(StorageProvider.R2);
        assertThat(stored.getOriginalName()).isEqualTo("hồ sơ.PDF");
        assertThat(request.getValue().key()).matches("internlink/CV/[a-f0-9-]+\\.pdf");
        assertThat(request.getValue().bucket()).isEqualTo("private-documents");
        assertThat(request.getValue().metadata().get("sha256"))
                .isEqualTo("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
        assertThat(body.getValue().contentStreamProvider().newStream().readAllBytes())
                .isEqualTo("abc".getBytes(StandardCharsets.UTF_8));
        assertThat(stored.getSizeBytes()).isEqualTo(3);
    }

    @Test
    void oversizedUploadFailsBeforeContactingCloud() {
        settings.setMaxFileBytes(2);
        assertThatThrownBy(
                        () ->
                                storage.store(
                                        new MockMultipartFile(
                                                "file", "x.pdf", "application/pdf", new byte[3]),
                                        "CV"))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(client);
    }

    @Test
    void downloadsRemainBounded() {
        settings.setMaxFileBytes(2);
        when(client.getObject(any(GetObjectRequest.class)))
                .thenReturn(
                        new ResponseInputStream<>(
                                GetObjectResponse.builder().contentLength(3L).build(),
                                AbortableInputStream.create(
                                        new ByteArrayInputStream(new byte[3]))));
        assertThatThrownBy(() -> storage.loadAsResource("internlink/CV/test.pdf"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void missingObjectBecomesNotFound() {
        when(client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());
        assertThatThrownBy(() -> storage.loadAsResource("internlink/CV/test.pdf"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void cannotLoadOrDeleteAnotherPrefix() {
        for (String key :
                new String[] {
                    "other/CV/test.pdf", "../test", "/internlink/test", "https://example.com/test"
                }) {
            assertThatThrownBy(() -> storage.loadAsResource(key))
                    .isInstanceOf(BadRequestException.class);
            assertThatThrownBy(() -> storage.delete(key)).isInstanceOf(BadRequestException.class);
        }
        verifyNoInteractions(client);
    }

    @Test
    void malformedContentTypeFailsBeforeContactingCloud() {
        assertThatThrownBy(
                        () ->
                                storage.store(
                                        new MockMultipartFile(
                                                "file", "x.pdf", "not-a-mime-type", new byte[] {1}),
                                        "CV"))
                .isInstanceOf(BadRequestException.class);
        verifyNoInteractions(client);
    }
}
