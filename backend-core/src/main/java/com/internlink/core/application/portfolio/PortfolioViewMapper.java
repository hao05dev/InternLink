package com.internlink.core.application.portfolio;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.PortfolioForm;
import com.internlink.core.domain.placement.PortfolioRevision;
import com.internlink.core.domain.placement.PortfolioSignedFile;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioRevisionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioSignedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.BiFunction;

@Component
@RequiredArgsConstructor
public class PortfolioViewMapper {

    private final JpaPortfolioRevisionRepository revisions;
    private final JpaPortfolioSignedFileRepository signedFiles;

    public record FormView(
        UUID id,
        String kind,
        String status,
        Integer version,
        String templateVersion,
        boolean published,
        boolean canRead,
        boolean canEdit,
        boolean canReview,
        boolean canPublish,
        Map<String, Object> content,
        String feedback,
        OffsetDateTime updatedAt,
        List<RevisionView> revisions,
        List<FileView> signedFiles
    ) {}

    public record RevisionView(
        UUID id,
        String action,
        String actor,
        String note,
        OffsetDateTime createdAt,
        boolean downloadable
    ) {}

    public record FileView(
        UUID id,
        String name,
        UUID revisionId,
        OffsetDateTime uploadedAt
    ) {}

    public FormView toFormView(PortfolioForm f, User a, BiFunction<PortfolioForm, Map<String, Object>, Map<String, Object>> followingContentFn) {
        boolean read = PortfolioAccess.content(a, f);
        boolean edit = PortfolioAccess.edit(a, f);
        boolean review = "M05".equals(f.getKind()) && PortfolioAccess.lecturer(a, f.getPlacement());
        boolean restricted = isPublishedReader(a, f);

        UUID visibleRevision = restricted ? findCurrentRevision(f).map(PortfolioRevision::getId).orElse(null) : null;

        List<RevisionView> history = !read || f.getId() == null || restricted ? List.of()
            : revisions.findByFormIdOrderByCreatedAtDesc(f.getId()).stream()
                .map(r -> new RevisionView(r.getId(), r.getAction(), r.getActor().getFullName(), r.getNote(), r.getCreatedAt(), r.getDocx() != null))
                .toList();

        List<FileView> files = !read || f.getId() == null ? List.of()
            : signedFiles.findByFormIdOrderByCreatedAtDesc(f.getId()).stream()
                .filter(file -> !restricted || file.getRevision().getId().equals(visibleRevision))
                .map(this::toFileView)
                .toList();

        Map<String, Object> visibleContent = f.getContent();
        if ("M02".equals(f.getKind()) && Set.of("DRAFT", "REVISION_REQUIRED").contains(formStatus(f))) {
            visibleContent = followingContentFn.apply(f, visibleContent);
        }

        return new FormView(
            f.getId(),
            f.getKind(),
            formStatus(f),
            f.getId() == null ? null : f.getVersion(),
            f.getTemplateVersion(),
            f.isPublished(),
            read,
            edit,
            review,
            PortfolioAccess.faculty(a, f.getPlacement()),
            read ? visibleContent : null,
            read ? (f.getReport() != null ? f.getReport().getLecturerFeedback() : f.getFeedback()) : null,
            f.getUpdatedAt(),
            history,
            files
        );
    }

    public FileView toFileView(PortfolioSignedFile f) {
        return new FileView(f.getId(), f.getFileName(), f.getRevision().getId(), f.getCreatedAt());
    }

    public boolean isPublishedReader(User a, PortfolioForm f) {
        return PortfolioAccess.confidential(f.getKind()) &&
            (PortfolioAccess.student(a, f.getPlacement()) || ("M04".equals(f.getKind()) && PortfolioAccess.mentor(a, f.getPlacement())));
    }

    public Optional<PortfolioRevision> findCurrentRevision(PortfolioForm f) {
        if (f.getId() == null) return Optional.empty();
        var doc = revisions.findFirstByFormIdAndDocxIsNotNullOrderByCreatedAtDesc(f.getId());
        return doc.isPresent() ? doc : revisions.findByFormIdOrderByCreatedAtDesc(f.getId()).stream()
            .filter(r -> "OFFLINE_ORIGINAL".equals(r.getAction()))
            .findFirst();
    }

    public String formStatus(PortfolioForm f) {
        return f.getReport() != null ? f.getReport().getStatus() : f.getStatus();
    }
}
