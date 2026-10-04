package com.internlink.core.application.system.upload;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;

import org.junit.jupiter.api.Test;

import java.util.*;

class MediaReferencePolicyTest {
    @Test
    void rejectsBrowserOnlyReferencesAndCrossCompanyAssets() {
        var assets = mock(MediaAssetRepository.class);
        var policy = new MediaReferencePolicy(assets);
        var company = UUID.randomUUID();
        var id = UUID.randomUUID();
        var asset =
                new MediaAssetRepository.Asset(
                        id,
                        UUID.randomUUID(),
                        MediaPurpose.JOB_BANNER,
                        UUID.randomUUID(),
                        null,
                        "key",
                        "a.png",
                        "image/png",
                        10,
                        "checksum");
        when(assets.get(id)).thenReturn(asset);
        assertThatThrownBy(() -> policy.job(company, "blob:http://localhost/photo", List.of(), ""))
                .hasMessageContaining("blob/base64");
        assertThatThrownBy(() -> policy.job(company, asset.url(), List.of(), ""))
                .hasMessageContaining("đúng doanh nghiệp");
    }

    @Test
    void acceptsManagedBannerOnlyForItsMatchingPurposeAndCompany() {
        var assets = mock(MediaAssetRepository.class);
        var policy = new MediaReferencePolicy(assets);
        var company = UUID.randomUUID();
        var id = UUID.randomUUID();
        var asset =
                new MediaAssetRepository.Asset(
                        id,
                        UUID.randomUUID(),
                        MediaPurpose.JOB_BANNER,
                        company,
                        null,
                        "key",
                        "a.png",
                        "image/png",
                        10,
                        "checksum");
        when(assets.get(id)).thenReturn(asset);
        assertThatCode(() -> policy.job(company, asset.url(), List.of(), ""))
                .doesNotThrowAnyException();
        assertThatThrownBy(
                        () ->
                                policy.job(
                                        company, null, List.of(Map.of("fileUrl", asset.url())), ""))
                .hasMessageContaining("mục đích");
    }
}
