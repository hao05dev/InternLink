package com.internlink.core.application.system.upload;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.integration.storage.*;
import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;
import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.*;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.*;

import java.util.UUID;

class MediaAssetServiceTest {
    @Test
    void databaseRollbackDeletesNewR2Object() throws Exception {
        var assets = mock(MediaAssetRepository.class);
        var access = mock(MediaAccessPolicy.class);
        var validator = mock(MediaContentValidator.class);
        var scanner = mock(ClamAvScanner.class);
        var r2 = mock(R2StorageService.class);
        var user = new User();
        user.setId(UUID.randomUUID());
        var company = UUID.randomUUID();
        var file = new MockMultipartFile("file", "a.png", "image/png", new byte[] {1});
        when(access.actor()).thenReturn(user);
        when(access.requireUpload(user, MediaPurpose.JOB_BANNER, company, null))
                .thenReturn(company);
        when(validator.validate(file, MediaPurpose.JOB_BANNER))
                .thenReturn(
                        new MediaContentValidator.Content("a.png", "image/png", new byte[] {1}));
        when(r2.storeBytes(any(), anyString(), anyString(), anyString()))
                .thenReturn(
                        StoredFileInfo.builder()
                                .provider(StorageProvider.R2)
                                .providerFileId("internlink/media/key.png")
                                .sizeBytes(1L)
                                .checksum("sum")
                                .build());
        doThrow(new IllegalStateException("database")).when(assets).insert(any());
        TransactionSynchronizationManager.initSynchronization();
        try {
            assertThatThrownBy(
                            () ->
                                    new MediaAssetService(assets, access, validator, scanner, r2)
                                            .upload(file, MediaPurpose.JOB_BANNER, company, null))
                    .hasMessage("database");
            for (var callback : TransactionSynchronizationManager.getSynchronizations())
                callback.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
            verify(r2).delete("internlink/media/key.png");
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void publicEndpointNeverReturnsPrivatePortfolioImage() {
        var assets = mock(MediaAssetRepository.class);
        var access = mock(MediaAccessPolicy.class);
        var r2 = mock(R2StorageService.class);
        var id = UUID.randomUUID();
        when(assets.get(id))
                .thenReturn(
                        new MediaAssetRepository.Asset(
                                id,
                                UUID.randomUUID(),
                                MediaPurpose.PORTFOLIO_IMAGE,
                                UUID.randomUUID(),
                                "M03",
                                "private/key",
                                "a.png",
                                "image/png",
                                1,
                                "sum"));
        assertThatThrownBy(
                        () ->
                                new MediaAssetService(
                                                assets,
                                                access,
                                                mock(MediaContentValidator.class),
                                                mock(ClamAvScanner.class),
                                                r2)
                                        .download(id, true))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(r2);
    }
}
