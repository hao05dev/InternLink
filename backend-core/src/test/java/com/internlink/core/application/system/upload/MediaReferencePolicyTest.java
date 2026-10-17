package com.internlink.core.application.system.upload;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;

import org.junit.jupiter.api.Test;

import java.util.*;

class MediaReferencePolicyTest {
    @Test
    void companyImagesRequireManagedMatchingPurposeAndCompany() {
        var assets = mock(MediaAssetRepository.class);
        var policy = new MediaReferencePolicy(assets);
        var company = UUID.randomUUID();
        var logo = new MediaAssetRepository.Asset(UUID.randomUUID(), UUID.randomUUID(),
                MediaPurpose.COMPANY_LOGO, company, null, "key", "logo.png", "image/png", 10, "sum");
        when(assets.get(logo.id())).thenReturn(logo);
        assertThatCode(() -> policy.company(company, logo.url(), null)).doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.company(UUID.randomUUID(), logo.url(), null))
                .hasMessageContaining("đúng doanh nghiệp");
        assertThatThrownBy(() -> policy.company(company, null, logo.url()))
                .hasMessageContaining("mục đích");
        assertThatThrownBy(() -> policy.company(company, "https://example.com/logo.png", null))
                .hasMessageContaining("tải ảnh công ty");
    }

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
