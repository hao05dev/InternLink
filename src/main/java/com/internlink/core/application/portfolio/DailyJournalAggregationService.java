package com.internlink.core.application.portfolio;

import com.internlink.core.domain.placement.DailyJournal;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.WeeklyLogbook;
import com.internlink.core.infrastructure.persistence.jpa.JpaDailyJournalRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaWeeklyLogbookRepository;
import com.internlink.core.shared.enums.SupervisionMode;
import com.internlink.core.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyJournalAggregationService {

    private final JpaDailyJournalRepository journals;
    private final JpaWeeklyLogbookRepository weekly;

    public List<DailyJournalService.Week> aggregate(InternshipPlacement p) {
        List<DailyJournal> all = journals.findByPlacementIdOrderByWorkDateAsc(p.getId());
        List<WeeklyLogbook> existing = weekly.findByPlacementIdOrderByWeekNumberAsc(p.getId());
        int count = (int) (ChronoUnit.DAYS.between(p.getStartDate(), p.getEndDate()) / 7) + 1;
        List<DailyJournalService.Week> result = new ArrayList<>();

        boolean isAcademicFollowup = p.getSupervisionMode() == SupervisionMode.ACADEMIC_FOLLOWUP;

        for (int n = 1; n <= count; n++) {
            LocalDate start = p.getStartDate().plusWeeks(n - 1);
            LocalDate end = start.plusDays(6).isAfter(p.getEndDate()) ? p.getEndDate() : start.plusDays(6);

            List<DailyJournal> daysInWeek = all.stream()
                    .filter(j -> !j.getWorkDate().isBefore(start) && !j.getWorkDate().isAfter(end))
                    .toList();

            List<DailyJournal> confirmed = daysInWeek.stream()
                    .filter(j -> "CONFIRMED".equals(j.getStatus()))
                    .toList();

            List<DailyJournal> eligible = isAcademicFollowup
                    ? daysInWeek.stream().filter(j -> "CONFIRMED".equals(j.getStatus()) || "SUBMITTED".equals(j.getStatus())).toList()
                    : confirmed;

            int weekNumber = n;
            WeeklyLogbook log = existing.stream()
                    .filter(l -> l.getWeekNumber() == weekNumber)
                    .findFirst()
                    .orElse(null);

            result.add(new DailyJournalService.Week(
                    n,
                    start,
                    end,
                    (int) daysInWeek.stream().filter(j -> !"DRAFT".equals(j.getStatus())).count(),
                    confirmed.size(),
                    eligible.stream().mapToInt(DailyJournal::getSessions).sum(),
                    eligible.stream().map(DailyJournal::getHours).reduce(BigDecimal.ZERO, BigDecimal::add),
                    join(eligible, "tasks"),
                    join(eligible, "results"),
                    join(eligible, "reflection"),
                    log == null ? "NOT_SUBMITTED" : log.getStatus().name(),
                    log == null ? null : log.getId()));
        }
        return result;
    }

    public void validateWeekForSubmission(InternshipPlacement p, DailyJournalService.Week w) {
        if (w.end().isAfter(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))) {
            throw new BadRequestException("Chỉ tổng hợp khi tuần đã kết thúc");
        }

        List<DailyJournal> weekJournals = journals.findByPlacementIdOrderByWorkDateAsc(p.getId()).stream()
                .filter(j -> !j.getWorkDate().isBefore(w.start()) && !j.getWorkDate().isAfter(w.end()))
                .toList();

        if (p.getSupervisionMode() == SupervisionMode.ACADEMIC_FOLLOWUP) {
            if (weekJournals.isEmpty() || w.submittedDays() == 0) {
                throw new BadRequestException("Chưa có nhật ký ngày nào được gửi trong tuần này");
            }
            boolean hasDraftOrRevision = weekJournals.stream()
                    .anyMatch(j -> "DRAFT".equals(j.getStatus()) || "REVISION_REQUIRED".equals(j.getStatus()));
            if (hasDraftOrRevision) {
                throw new BadRequestException("Còn nhật ký ngày ở trạng thái nháp hoặc cần sửa đổi trong tuần");
            }
        } else {
            if (w.confirmedDays() == 0) {
                throw new BadRequestException("Chưa có nhật ký ngày được xác nhận");
            }
            boolean unresolved = weekJournals.stream().anyMatch(j -> !"CONFIRMED".equals(j.getStatus()));
            if (unresolved) {
                throw new BadRequestException("Còn nhật ký ngày chưa được xác nhận trong tuần");
            }
        }
    }

    private String join(List<DailyJournal> days, String field) {
        return days.stream()
                .map(j -> j.getWorkDate() + ": " + RichText.text(switch (field) {
                    case "tasks" -> j.getTasks();
                    case "results" -> j.getResults();
                    default -> j.getReflection();
                }))
                .collect(Collectors.joining("\n"));
    }
}
