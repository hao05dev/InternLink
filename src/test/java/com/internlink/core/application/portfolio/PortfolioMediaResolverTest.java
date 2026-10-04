package com.internlink.core.application.portfolio;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.application.system.upload.*;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.integration.storage.R2StorageService;
import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;

import java.util.*;

class PortfolioMediaResolverTest {
    @Test
    void exportEmbedsR2BytesWithoutSavingBase64ToTheSourceContent() {
        var assets = mock(MediaAssetRepository.class);
        var access = mock(MediaAccessPolicy.class);
        var r2 = mock(R2StorageService.class);
        var actor = new User();
        var placement = UUID.randomUUID();
        var id = UUID.randomUUID();
        var asset =
                new MediaAssetRepository.Asset(
                        id,
                        UUID.randomUUID(),
                        MediaPurpose.PORTFOLIO_IMAGE,
                        placement,
                        "M05",
                        "private/key.png",
                        "a.png",
                        "image/png",
                        1,
                        "sum");
        when(assets.get(id)).thenReturn(asset);
        when(access.actor()).thenReturn(actor);
        when(access.canRead(actor, asset)).thenReturn(true);
        when(r2.loadAsResource(asset.key()))
                .thenReturn(new ByteArrayResource(new byte[] {1, 2, 3}));
        var source =
                Map.<String, Object>of(
                        "sections", Map.of("outcomes", "<p><img src='" + asset.url() + "'/></p>"));
        var result =
                new PortfolioMediaResolver(assets, access, r2)
                        .inlineForExport(source, placement, "M05");
        assertThat(result.toString())
                .contains("data:image/png;base64,AQID")
                .doesNotContain(asset.url());
        assertThat(source.toString()).contains(asset.url()).doesNotContain("base64");
        assertThat(RichText.clean("<img src='" + asset.url() + "'/>")).contains(asset.url());
    }

    @Test
    void limitsTotalManagedImagesBeforeAllocatingExportData() {
        var assets = mock(MediaAssetRepository.class);
        var access = mock(MediaAccessPolicy.class);
        var r2 = mock(R2StorageService.class);
        var actor = new User();
        var placement = UUID.randomUUID();
        var id = UUID.randomUUID();
        var asset =
                new MediaAssetRepository.Asset(
                        id,
                        UUID.randomUUID(),
                        MediaPurpose.PORTFOLIO_IMAGE,
                        placement,
                        "M05",
                        "key",
                        "a.png",
                        "image/png",
                        1,
                        "sum");
        when(assets.get(id)).thenReturn(asset);
        when(access.actor()).thenReturn(actor);
        when(access.canRead(actor, asset)).thenReturn(true);
        assertThatThrownBy(
                        () ->
                                new PortfolioMediaResolver(assets, access, r2)
                                        .validate(
                                                Map.of(
                                                        "html",
                                                        ("<img src='" + asset.url() + "'/>")
                                                                .repeat(33)),
                                                placement,
                                                "M05"))
                .hasMessageContaining("32 ảnh");
        verifyNoInteractions(r2);
    }

    @Test
    void rejectsImageCopiedFromAnotherPlacementBeforeExport() {
        var assets = mock(MediaAssetRepository.class);
        var access = mock(MediaAccessPolicy.class);
        var r2 = mock(R2StorageService.class);
        var id = UUID.randomUUID();
        var asset =
                new MediaAssetRepository.Asset(
                        id,
                        UUID.randomUUID(),
                        MediaPurpose.PORTFOLIO_IMAGE,
                        UUID.randomUUID(),
                        "M05",
                        "private/key",
                        "a.png",
                        "image/png",
                        1,
                        "sum");
        when(assets.get(id)).thenReturn(asset);
        assertThatThrownBy(
                        () ->
                                new PortfolioMediaResolver(assets, access, r2)
                                        .inlineForExport(
                                                Map.of("html", "<img src='" + asset.url() + "'/>"),
                                                UUID.randomUUID(),
                                                "M05"))
                .hasMessageContaining("phạm vi");
        verifyNoInteractions(r2);
    }
}
