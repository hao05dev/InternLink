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
        assertThatThrownBy(() -> policy.job(company, "blob:http://localhost/photo", List.of(), List.of(), ""))
                .hasMessageContaining("blob/base64");
        assertThatThrownBy(() -> policy.job(company, asset.url(), List.of(), List.of(), ""))
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
        assertThatCode(() -> policy.job(company, asset.url(), List.of(), List.of(), ""))
                .doesNotThrowAnyException();
        assertThatThrownBy(
                        () ->
                                policy.job(
                                        company, null, List.of(Map.of("fileUrl", asset.url())), List.of(), ""))
                .hasMessageContaining("mục đích");
    }

    @Test
    void jobAttachmentsAcceptOnlyManagedFilesOfSameCompanyUnlessAlreadyStored() {
        var assets = mock(MediaAssetRepository.class);
        var policy = new MediaReferencePolicy(assets);
        var company = UUID.randomUUID();
        var id = UUID.randomUUID();
        var pdf = new MediaAssetRepository.Asset(id, UUID.randomUUID(),
                MediaPurpose.JOB_ATTACHMENT, company, null, "key", "jd.pdf", "application/pdf", 10, "checksum");
        when(assets.get(id)).thenReturn(pdf);
        var managed = List.<Map<String, Object>>of(Map.of("fileUrl", pdf.url()));
        assertThatCode(() -> policy.job(company, null, managed, List.of(), "")).doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.job(company, null,
                List.<Map<String, Object>>of(Map.of("fileUrl", "https://evil.example/x.pdf")), List.of(), ""))
                .hasMessageContaining("liên kết ngoài");
        // Liên kết cũ đã nằm sẵn trong tin vẫn được giữ khi sửa tin
        var legacy = List.<Map<String, Object>>of(Map.of("fileUrl", "https://old.example/jd.pdf"));
        assertThatCode(() -> policy.job(company, null, legacy, legacy, "")).doesNotThrowAnyException();
        var tooMany = Collections.nCopies(21, Map.<String, Object>of("fileUrl", pdf.url()));
        assertThatThrownBy(() -> policy.job(company, null, tooMany, List.of(), ""))
                .hasMessageContaining("Tối đa 20");
    }
}
