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
    private static final int MAX_ATTACHMENTS = 20;
    private final MediaAssetRepository assets;
    public static final Pattern URL =
            Pattern.compile(
                    "/api/v1/(?:public/)?media/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})");

    public void company(UUID company, String logo, String cover) {
        requireCompanyImage(logo, MediaPurpose.COMPANY_LOGO, company);
        requireCompanyImage(cover, MediaPurpose.COMPANY_COVER, company);
    }

    private void requireCompanyImage(String url, MediaPurpose purpose, UUID company) {
        if (url == null || url.isBlank()) return;
        if (!URL.matcher(url).matches())
            throw new BadRequestException("Vui lòng tải ảnh công ty lên hệ thống.");
        require(url, purpose, company);
    }

    public void job(
            UUID company,
            String banner,
            List<Map<String, Object>> attachments,
            List<Map<String, Object>> storedAttachments,
            String description) {
        require(banner, MediaPurpose.JOB_BANNER, company);
        jobAttachments(company, attachments, storedAttachments);
        embedded(description, MediaPurpose.JOB_IMAGE, company);
    }

    /**
     * Đính kèm tin tuyển dụng chỉ nhận tệp đã tải lên (managed URL) của đúng doanh nghiệp.
     * URL http(s) chỉ được giữ lại khi đã nằm sẵn trong tin (dữ liệu cũ khi sửa tin).
     */
    private void jobAttachments(
            UUID company, List<Map<String, Object>> attachments, List<Map<String, Object>> stored) {
        if (attachments == null) return;
        if (attachments.size() > MAX_ATTACHMENTS)
            throw new BadRequestException("Tối đa " + MAX_ATTACHMENTS + " tệp đính kèm");
        Set<String> kept = new HashSet<>();
        if (stored != null)
            for (var item : stored) kept.add(Objects.toString(item.get("fileUrl"), ""));
        for (var item : attachments) {
            String url = Objects.toString(item.get("fileUrl"), "");
            if (kept.contains(url)) continue;
            requireManaged(url, MediaPurpose.JOB_ATTACHMENT, company);
        }
    }

    public void post(
            UUID author, String cover, List<Map<String, Object>> attachments, String content) {
        require(cover, MediaPurpose.POST_COVER, author);
        attachments(attachments, MediaPurpose.POST_ATTACHMENT, author);
        embedded(content, MediaPurpose.POST_IMAGE, author);
    }

    private void attachments(List<Map<String, Object>> list, MediaPurpose purpose, UUID context) {
        if (list == null) return;
        if (list.size() > MAX_ATTACHMENTS)
            throw new BadRequestException("Tối đa " + MAX_ATTACHMENTS + " tệp đính kèm");
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
        requireManaged(url, purpose, context);
    }

    private void requireManaged(String url, MediaPurpose purpose, UUID context) {
        var match = URL.matcher(url == null ? "" : url);
        if (!match.matches())
            throw new BadRequestException(
                    "Tệp đính kèm phải là tệp đã tải lên; không nhận blob/base64 hoặc liên kết ngoài");
        var asset = assets.get(UUID.fromString(match.group(1)));
        if (!asset.url().equals(url)
                || asset.purpose() != purpose
                || !Objects.equals(asset.context(), context))
            throw new BadRequestException(
                    "Ảnh/tệp không thuộc đúng doanh nghiệp, tác giả hoặc mục đích");
    }
}
