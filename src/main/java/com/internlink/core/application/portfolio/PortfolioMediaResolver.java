package com.internlink.core.application.portfolio;

import com.internlink.core.application.system.upload.*;
import com.internlink.core.infrastructure.integration.storage.R2StorageService;
import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;
import com.internlink.core.shared.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

@Component
@RequiredArgsConstructor
public class PortfolioMediaResolver {
    private final MediaAssetRepository assets;
    private final MediaAccessPolicy access;
    private final R2StorageService r2;

    public void validate(Object value, UUID placement, String kind) {
        walk(value, placement, kind, false, new Budget());
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> inlineForExport(
            Map<String, Object> content, UUID placement, String kind) {
        return (Map<String, Object>) walk(content, placement, kind, true, new Budget());
    }

    private static final class Budget {
        int references;
        long bytes;
    }

    private Object walk(Object value, UUID placement, String kind, boolean inline, Budget budget) {
        if (value instanceof Map<?, ?> source) {
            Map<String, Object> out = new LinkedHashMap<>();
            source.forEach(
                    (k, v) -> out.put(String.valueOf(k), walk(v, placement, kind, inline, budget)));
            return out;
        }
        if (value instanceof List<?> list)
            return list.stream().map(v -> walk(v, placement, kind, inline, budget)).toList();
        if (!(value instanceof String html) || !html.contains("/api/v1/media/")) return value;
        var doc = Jsoup.parseBodyFragment(html);
        doc.outputSettings()
                .syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml)
                .prettyPrint(false);
        var actor = access.actor();
        for (var image : doc.select("img[src]")) {
            String url = image.attr("src");
            if (!url.startsWith("/api/v1/media/")) continue;
            var match = MediaReferencePolicy.URL.matcher(url);
            if (!match.matches()) throw new BadRequestException("Đường dẫn ảnh không hợp lệ");
            var asset = assets.get(UUID.fromString(match.group(1)));
            boolean scope =
                    Objects.equals(asset.scope(), kind)
                            || ("M02".equals(kind)
                                    && Set.of("M01", "DAILY").contains(asset.scope()));
            if (!asset.purpose().privateImage()
                    || !asset.url().equals(url)
                    || !placement.equals(asset.context())
                    || !scope
                    || !access.canRead(actor, asset))
                throw new BadRequestException("Ảnh không thuộc phạm vi biểu mẫu/nhật ký");
            if (++budget.references > 32 || (budget.bytes += asset.size()) > 20L * 1024 * 1024)
                throw new BadRequestException(
                        "Nội dung tối đa 32 ảnh và tổng dung lượng ảnh 20 MiB");
            if (inline)
                try {
                    byte[] bytes = r2.loadAsResource(asset.key()).getContentAsByteArray();
                    image.attr(
                            "src",
                            "data:"
                                    + asset.mime()
                                    + ";base64,"
                                    + Base64.getEncoder().encodeToString(bytes));
                } catch (IOException ex) {
                    throw new IllegalStateException("Không tải được ảnh để xuất DOCX");
                }
        }
        return inline ? doc.body().html() : value;
    }
}
