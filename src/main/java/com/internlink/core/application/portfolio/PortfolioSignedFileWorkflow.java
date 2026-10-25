package com.internlink.core.application.portfolio;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.PortfolioForm;
import com.internlink.core.domain.placement.PortfolioRevision;
import com.internlink.core.domain.placement.PortfolioSignedFile;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioFormRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioRevisionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioSignedFileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
class PortfolioSignedFileWorkflow {
    private final JpaInternshipPlacementRepository placements;
    private final JpaUserRepository users;
    private final JpaPortfolioFormRepository forms;
    private final JpaPortfolioRevisionRepository revisions;
    private final JpaPortfolioSignedFileRepository signedFiles;
    private final SecurityGuard security;
    private final PortfolioViewMapper views;
    private final PortfolioFileStorage storage;
    private final PortfolioFormSupport support;

    @Transactional
    PortfolioService.FileView upload(UUID placementId, String kind, UUID revisionId, MultipartFile file) throws IOException {
        InternshipPlacement placement = placement(placementId, true);
        PortfolioForm form = support.load(placement, kind);
        User actor = actor();
        boolean offline = placement.getMentor() == null && PortfolioAccess.lecturer(actor, placement)
                && Set.of("M01", "M02", "M03").contains(kind);
        boolean proxy = PortfolioAccess.proxyUpload(actor, placement, kind);
        ResourceAuthorization.require(PortfolioAccess.edit(actor, form) || offline || proxy);
        if (form.isPublished()) throw new BadRequestException("Cần thu hồi công bố trước khi bổ sung bản ký");
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024)
            throw new BadRequestException("Bản ký phải có dung lượng từ 1 byte đến 10 MB");
        byte[] bytes = file.getBytes();
        String mime = PortfolioMetadataHelper.detectMime(bytes);
        if (mime == null) throw new BadRequestException("Bản ký chỉ nhận PDF, PNG hoặc JPEG");

        PortfolioRevision revision;
        if ((proxy || offline) && form.getId() == null) {
            form.setStatus(proxy ? "SUBMITTED" : "COMPLETED");
            form.setUpdatedBy(actor);
            form = forms.saveAndFlush(form);
            revision = support.snapshot(form, actor, proxy ? "PROXY_SUBMISSION" : "OFFLINE_ORIGINAL",
                    proxy ? "Sinh viên nộp thay bản scan do đơn vị ký duyệt, chờ GVHD thẩm định"
                            : "Phiếu gốc do cơ quan hoàn thành, giảng viên tiếp nhận", null);
        } else {
            if (form.getId() == null || !Set.of("COMPLETED", "APPROVED", "SUBMITTED").contains(views.formStatus(form)))
                throw new BadRequestException("Hoàn thành nội dung trước khi lưu bản ký");
            revision = revisionId == null
                    ? revisions.findFirstByFormIdAndDocxIsNotNullOrderByCreatedAtDesc(form.getId()).orElse(null)
                    : revisions.findById(revisionId).orElse(null);
            if (revision == null && (offline || proxy)) revision = revisions.findByFormIdOrderByCreatedAtDesc(form.getId()).stream()
                    .filter(item -> Set.of("OFFLINE_ORIGINAL", "PROXY_SUBMISSION").contains(item.getAction())).findFirst().orElse(null);
            if (revision == null || !revision.getForm().getId().equals(form.getId()))
                throw new BadRequestException("Chọn đúng phiên bản được ký");
        }
        PortfolioSignedFile saved = new PortfolioSignedFile();
        saved.setForm(form); saved.setRevision(revision); saved.setUploadedBy(actor);
        saved.setFileName((file.getOriginalFilename() == null ? "Ban-da-ky" : file.getOriginalFilename()).replaceAll("[\\\\/\\r\\n]", "_"));
        saved.setMimeType(mime); storage.store(saved, bytes); saved = signedFiles.saveAndFlush(saved);
        support.snapshot(form, actor, "SIGNED_FILE", "Đã lưu bản ký cho phiên bản " + revision.getId(), null);
        return new PortfolioService.FileView(saved.getId(), saved.getFileName(), saved.getRevision().getId(), saved.getCreatedAt());
    }

    @Transactional(readOnly = true)
    PortfolioService.Download download(UUID placementId, String kind, UUID fileId) {
        PortfolioForm form = support.load(placement(placementId, false), kind);
        ResourceAuthorization.require(PortfolioAccess.content(actor(), form));
        PortfolioSignedFile file = signedFiles.findById(fileId).orElseThrow(
                () -> new ResourceNotFoundException("PortfolioSignedFile", "id", fileId));
        ResourceAuthorization.require(form.getId() != null && form.getId().equals(file.getForm().getId()));
        if (views.isPublishedReader(actor(), form)) ResourceAuthorization.require(
                views.findCurrentRevision(form).map(item -> item.getId().equals(file.getRevision().getId())).orElse(false));
        return new PortfolioService.Download(file.getFileName(), file.getMimeType(), storage.read(file));
    }

    private InternshipPlacement placement(UUID id, boolean lock) {
        return (lock ? placements.findLockedById(id) : placements.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", id));
    }

    private User actor() {
        UUID id = security.currentUser().getId();
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
