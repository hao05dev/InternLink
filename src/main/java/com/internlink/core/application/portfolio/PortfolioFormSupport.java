package com.internlink.core.application.portfolio;

import static com.internlink.core.application.portfolio.PortfolioContent.canonical;
import static com.internlink.core.application.portfolio.PortfolioContent.clean;
import static com.internlink.core.application.portfolio.PortfolioContent.number;
import static com.internlink.core.application.portfolio.PortfolioContent.rows;
import static com.internlink.core.application.portfolio.PortfolioContent.string;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.PortfolioForm;
import com.internlink.core.domain.placement.PortfolioRevision;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioFormRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPortfolioRevisionRepository;
import com.internlink.core.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
class PortfolioFormSupport {
    private final JpaPortfolioFormRepository forms;
    private final JpaPortfolioRevisionRepository revisions;
    private final DailyJournalService daily;
    private final PortfolioMetadataHelper metadata;
    private final PortfolioViewMapper views;

    PortfolioRevision snapshot(PortfolioForm form, User actor, String action, String note, byte[] docx) {
        PortfolioRevision revision = new PortfolioRevision();
        revision.setForm(form);
        revision.setActor(actor);
        revision.setAction(action);
        revision.setNote(note);
        revision.setContent(new LinkedHashMap<>(form.getContent()));
        revision.setDocx(docx);
        return revisions.saveAndFlush(revision);
    }

    PortfolioService.FormView view(PortfolioForm form, User actor) {
        PortfolioViewMapper.FormView mapped = views.toFormView(
                form, actor, (item, content) -> followingContent(item.getPlacement(), content));
        return new PortfolioService.FormView(
                mapped.id(), mapped.kind(), mapped.status(), mapped.version(), mapped.templateVersion(),
                mapped.published(), mapped.canRead(), mapped.canEdit(), mapped.canReview(),
                mapped.canPublish(), mapped.content(), mapped.feedback(), mapped.updatedAt(),
                mapped.revisions().stream().map(item -> new PortfolioService.RevisionView(
                        item.id(), item.action(), item.actor(), item.note(), item.createdAt(), item.downloadable())).toList(),
                mapped.signedFiles().stream().map(item -> new PortfolioService.FileView(
                        item.id(), item.name(), item.revisionId(), item.uploadedAt())).toList());
    }

    PortfolioForm load(InternshipPlacement placement, String kind) {
        if (!PortfolioService.KINDS.contains(kind)) throw new BadRequestException("Mã biểu mẫu không hợp lệ");
        return forms.findByPlacementIdAndKind(placement.getId(), kind).orElseGet(() -> {
            PortfolioForm form = new PortfolioForm();
            form.setPlacement(placement);
            form.setKind(kind);
            Map<String, Object> content = new LinkedHashMap<>();
            if (List.of("M01", "M02").contains(kind)) {
                List<Map<String, Object>> weeks = new ArrayList<>();
                for (int number = 1; number <= metadata.weekCount(placement); number++) {
                    weeks.add(new LinkedHashMap<>(Map.of(
                            "week", number, "tasks", "", "comment", "", "sessions", 0, "hours", 0)));
                }
                content.put("weeks", weeks);
            }
            form.setContent("M02".equals(kind)
                    ? followingContent(placement, content)
                    : clean(kind, content, metadata.weekCount(placement)));
            return form;
        });
    }

    Map<String, Object> followingContent(InternshipPlacement placement, Map<String, Object> existing) {
        Map<String, Object> plan = forms.findByPlacementIdAndKind(placement.getId(), "M01")
                .map(PortfolioForm::getContent).orElse(Map.of());
        List<Map<String, Object>> resultRows = new ArrayList<>();
        for (var week : daily.aggregate(placement)) {
            Map<String, Object> planned = rows(plan).stream()
                    .filter(row -> number(row.get("week")).intValue() == week.number()).findFirst().orElse(Map.of());
            Map<String, Object> old = rows(existing).stream()
                    .filter(row -> number(row.get("week")).intValue() == week.number()).findFirst().orElse(Map.of());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("week", week.number()); row.put("tasks", string(planned, "tasks"));
            row.put("comment", string(old, "comment")); row.put("sessions", week.sessions());
            row.put("hours", week.hours()); resultRows.add(row);
        }
        Map<String, Object> result = new LinkedHashMap<>(existing);
        result.put("weeks", resultRows);
        return canonical(result);
    }
}
