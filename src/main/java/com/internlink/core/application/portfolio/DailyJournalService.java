package com.internlink.core.application.portfolio;

import com.internlink.core.application.placement.WeeklyLogbookService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.DailyJournal;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.infrastructure.persistence.jpa.JpaDailyJournalRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaWeeklyLogbookRepository;
import com.internlink.core.presentation.placement.dto.request.WeeklyLogbookRequest;
import com.internlink.core.presentation.placement.dto.response.WeeklyLogbookResponse;
import com.internlink.core.shared.enums.LogbookStatus;
import com.internlink.core.shared.enums.VerificationSource;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DailyJournalService {

    private final JpaDailyJournalRepository journals;
    private final JpaInternshipPlacementRepository placements;
    private final JpaUserRepository users;
    private final JpaWeeklyLogbookRepository weekly;
    private final WeeklyLogbookService weeklyService;
    private final DailyJournalAggregationService aggregationService;
    private final SecurityGuard security;
    private final PortfolioMediaResolver media;
    private final com.internlink.core.application.system.notification.PlacementWorkflowNotificationHelper notifications;

    public record Input(
            Integer version,
            @NotBlank String attendance,
            LocalTime startTime,
            LocalTime endTime,
            @Min(0) @Max(720) int breakMinutes,
            @Min(0) @Max(2) int sessions,
            @Size(max = 3000000) String tasks,
            @Size(max = 3000000) String results,
            @Size(max = 1000000) String reflection,
            @Size(max = 10000) String evidence,
            boolean submit) {}

    public record Review(
            @NotBlank String decision, @Size(max = 4000) String note, @NotNull Integer version) {}

    public record View(
            UUID id,
            LocalDate workDate,
            String attendance,
            LocalTime startTime,
            LocalTime endTime,
            int breakMinutes,
            int sessions,
            BigDecimal hours,
            String tasks,
            String results,
            String reflection,
            String evidence,
            String status,
            String reviewNote,
            String reviewer,
            OffsetDateTime submittedAt,
            OffsetDateTime reviewedAt,
            Integer version) {}

    public record Week(
            int number,
            LocalDate start,
            LocalDate end,
            int submittedDays,
            int confirmedDays,
            int sessions,
            BigDecimal hours,
            String tasks,
            String results,
            String reflection,
            String status,
            UUID logbookId) {}

    @Transactional(readOnly = true)
    public List<View> list(UUID placementId) {
        InternshipPlacement p = placement(placementId, false);
        requireRead(p);
        return journals.findByPlacementIdOrderByWorkDateAsc(placementId).stream()
                .map(this::view)
                .toList();
    }

    @Transactional
    public View save(UUID placementId, LocalDate date, Input in) {
        InternshipPlacement p = placement(placementId, true);
        User a = actor();
        ResourceAuthorization.require(PortfolioAccess.student(a, p));
        DailyJournalValidation.checkActiveAndTerm(p);
        DailyJournalValidation.checkDate(p, date);
        unlockedWeek(p, date);

        DailyJournal j = journals.findByPlacementIdAndWorkDate(placementId, date)
                .orElseGet(() -> {
                    DailyJournal value = new DailyJournal();
                    value.setPlacement(p);
                    value.setWorkDate(date);
                    return value;
                });

        DailyJournalValidation.checkVersion(j.getId() != null ? j.getVersion() : null, in.version());
        DailyJournalValidation.checkEditableStatus(j.getStatus());
        BigDecimal hours = DailyJournalValidation.calculateHours(in);

        String tasks = RichText.clean(in.tasks());
        String results = RichText.clean(in.results());
        String reflection = RichText.clean(in.reflection());
        DailyJournalValidation.validateContentOnSubmit(in, tasks, results, reflection);

        boolean working = java.util.Set.of("PRESENT", "REMOTE").contains(in.attendance());
        j.setAttendance(in.attendance());
        j.setStartTime(working ? in.startTime() : null);
        j.setEndTime(working ? in.endTime() : null);
        j.setBreakMinutes(working ? in.breakMinutes() : 0);
        j.setSessions(working ? in.sessions() : 0);
        j.setHours(hours);
        media.validate(List.of(tasks, results, reflection), p.getId(), "DAILY");
        j.setTasks(tasks);
        j.setResults(results);
        j.setReflection(reflection);
        j.setEvidence(in.evidence() == null ? "" : in.evidence().trim());

        if (in.submit()) {
            j.setStatus("SUBMITTED");
            j.setVerificationSource(VerificationSource.STUDENT_REPORTED);
            j.setSubmittedAt(OffsetDateTime.now());
            j.setReviewedBy(null);
            j.setReviewedAt(null);
            j.setReviewNote(null);
        }
        var saved = journals.saveAndFlush(j);
        if (in.submit()) {
            notifications.daily(p, a.getId(), true);
        }
        return view(saved);
    }

    @Transactional
    public View review(UUID placementId, LocalDate date, Review in) {
        InternshipPlacement p = placement(placementId, true);
        User a = actor();
        ResourceAuthorization.require(PortfolioAccess.confirmDaily(a, p));
        DailyJournalValidation.checkActiveAndTerm(p);
        unlockedWeek(p, date);

        DailyJournal j = journals.findByPlacementIdAndWorkDate(placementId, date)
                .orElseThrow(() -> new BadRequestException("Chưa có nhật ký cho ngày này"));

        DailyJournalValidation.checkVersion(j.getVersion(), in.version());
        DailyJournalValidation.validateReview(j, in);

        j.setStatus(in.decision());
        j.setVerificationSource(VerificationSource.MENTOR_VERIFIED);
        j.setReviewNote(in.note());
        j.setReviewedBy(a);
        j.setReviewedAt(OffsetDateTime.now());

        var saved = journals.saveAndFlush(j);
        notifications.daily(p, a.getId(), false);
        return view(saved);
    }

    @Transactional(readOnly = true)
    public List<Week> weeks(UUID placementId) {
        InternshipPlacement p = placement(placementId, false);
        requireRead(p);
        return aggregate(p);
    }

    @Transactional
    public WeeklyLogbookResponse submitWeek(UUID placementId, int number) {
        InternshipPlacement p = placement(placementId, true);
        User a = actor();
        ResourceAuthorization.require(PortfolioAccess.student(a, p));
        DailyJournalValidation.checkActiveAndTerm(p);

        Week w = aggregate(p).stream()
                .filter(v -> v.number() == number)
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Tuần không hợp lệ"));

        aggregationService.validateWeekForSubmission(p, w);

        return weeklyService.submitLogbook(
                a.getId(),
                new WeeklyLogbookRequest(
                        placementId,
                        number,
                        w.start(),
                        w.end(),
                        w.tasks().isBlank() ? "Không phát sinh công việc; xem nhật ký ngày đã ghi nhận." : w.tasks(),
                        w.reflection().isBlank() ? "Xem kết quả trong nhật ký ngày." : w.reflection(),
                        w.hours()));
    }

    public List<Week> aggregate(InternshipPlacement p) {
        return aggregationService.aggregate(p);
    }

    private void unlockedWeek(InternshipPlacement p, LocalDate date) {
        int n = (int) (ChronoUnit.DAYS.between(p.getStartDate(), date) / 7) + 1;
        weekly.findByPlacementIdAndWeekNumber(p.getId(), n).ifPresent(w -> {
            if (w.getStatus() != LogbookStatus.REVISION_REQUESTED && w.getStatus() != LogbookStatus.DRAFT) {
                throw new BadRequestException("Tuần đã gửi/duyệt; cần yêu cầu sửa nhật ký tuần trước");
            }
        });
    }

    private View view(DailyJournal j) {
        return new View(
                j.getId(),
                j.getWorkDate(),
                j.getAttendance(),
                j.getStartTime(),
                j.getEndTime(),
                j.getBreakMinutes(),
                j.getSessions(),
                j.getHours(),
                j.getTasks(),
                j.getResults(),
                j.getReflection(),
                j.getEvidence(),
                j.getStatus(),
                j.getReviewNote(),
                j.getReviewedBy() == null ? null : j.getReviewedBy().getFullName(),
                j.getSubmittedAt(),
                j.getReviewedAt(),
                j.getVersion());
    }

    private InternshipPlacement placement(UUID id, boolean lock) {
        return (lock ? placements.findLockedById(id) : placements.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", id));
    }

    private User actor() {
        UUID id = security.currentUser().getId();
        return users.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private void requireRead(InternshipPlacement p) {
        ResourceAuthorization.require(PortfolioAccess.read(actor(), p));
    }

    public static void active(InternshipPlacement p) {
        DailyJournalValidation.checkActiveAndTerm(p);
    }

    public static void checkVersion(Integer actual, Integer expected) {
        DailyJournalValidation.checkVersion(actual, expected);
    }
}
