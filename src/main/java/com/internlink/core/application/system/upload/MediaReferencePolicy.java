package com.internlink.core.application.system.upload;

import com.internlink.core.infrastructure.persistence.jdbc.MediaAssetRepository;
import com.internlink.core.shared.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.*;

@Component
@RequiredArgsConstructor
public class MediaReferencePolicy {
    private final MediaAssetRepository assets;
    public static final Pattern URL =
            Pattern.compile(
                    "/api/v1/(?:public/)?media/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})");

    public void job(
            UUID company,
            String banner,
            List<Map<String, Object>> attachments,
            String description) {
        require(banner, MediaPurpose.JOB_BANNER, company);
        attachments(attachments, MediaPurpose.JOB_ATTACHMENT, company);
        embedded(description, MediaPurpose.JOB_IMAGE, company);
    }

    public void post(
            UUID author, String cover, List<Map<String, Object>> attachments, String content) {
        require(cover, MediaPurpose.POST_COVER, author);
        attachments(attachments, MediaPurpose.POST_ATTACHMENT, author);
        embedded(content, MediaPurpose.POST_IMAGE, author);
    }

    private void attachments(List<Map<String, Object>> list, MediaPurpose purpose, UUID context) {
        if (list == null) return;
        if (list.size() > 20) throw new BadRequestException("Tối đa 20 tệp đính kèm");
        for (var item : list) require(Objects.toString(item.get("fileUrl"), ""), purpose, context);
    }

    private void embedded(String content, MediaPurpose purpose, UUID context) {
        if (content == null) return;
        var match = URL.matcher(content);
        while (match.find()) require(match.group(), purpose, context);
    }

    private void require(String url, MediaPurpose purpose, UUID context) {
        if (url == null || url.isBlank()) return;
        // Keep old remote references readable; newly uploaded files always use a managed URL.
        if (url.startsWith("https://") || url.startsWith("http://")) return;
        var match = URL.matcher(url);
        if (!match.matches())
            throw new BadRequestException(
                    "Tệp đính kèm phải là tệp đã tải lên; không nhận blob/base64");
        var asset = assets.get(UUID.fromString(match.group(1)));
        if (!asset.url().equals(url)
                || asset.purpose() != purpose
                || !Objects.equals(asset.context(), context))
            throw new BadRequestException(
                    "Ảnh/tệp không thuộc đúng doanh nghiệp, tác giả hoặc mục đích");
    }
}
