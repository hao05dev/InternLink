package com.internlink.core.application.portfolio;

import static com.internlink.core.application.portfolio.PortfolioTestData.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.internlink.core.domain.placement.DailyJournal;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.infrastructure.persistence.jpa.JpaDailyJournalRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaWeeklyLogbookRepository;
import com.internlink.core.shared.enums.SupervisionMode;
import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class DailyJournalAggregationServiceTest {

    @Mock JpaDailyJournalRepository journals;
    @Mock JpaWeeklyLogbookRepository weekly;

    DailyJournalAggregationService service;
    InternshipPlacement placement;

    @BeforeEach
    void setUp() {
        service = new DailyJournalAggregationService(journals, weekly);
        placement = placement();
    }

    @Test
    void testAcademicFollowupAllowsSubmissionWithSubmittedJournals() {
        placement.setSupervisionMode(SupervisionMode.ACADEMIC_FOLLOWUP);
        LocalDate start = placement.getStartDate();
        LocalDate end = start.plusDays(6);

        DailyJournal j1 = new DailyJournal();
        j1.setWorkDate(start);
        j1.setStatus("SUBMITTED");
        j1.setHours(BigDecimal.valueOf(8));

        when(journals.findByPlacementIdOrderByWorkDateAsc(placement.getId()))
                .thenReturn(List.of(j1));

        DailyJournalService.Week week = new DailyJournalService.Week(
                1, start, end, 1, 0, 1, BigDecimal.valueOf(8),
                "Tasks", "Results", "Reflection", "NOT_SUBMITTED", null);

        assertThatCode(() -> service.validateWeekForSubmission(placement, week))
                .doesNotThrowAnyException();
    }

    @Test
    void testMentorOnlineRequiresConfirmedJournals() {
        placement.setSupervisionMode(SupervisionMode.MENTOR_ONLINE);
        LocalDate start = placement.getStartDate();
        LocalDate end = start.plusDays(6);

        DailyJournal j1 = new DailyJournal();
        j1.setWorkDate(start);
        j1.setStatus("SUBMITTED");
        j1.setHours(BigDecimal.valueOf(8));

        DailyJournalService.Week week = new DailyJournalService.Week(
                1, start, end, 1, 0, 1, BigDecimal.valueOf(8),
                "Tasks", "Results", "Reflection", "NOT_SUBMITTED", null);

        assertThatThrownBy(() -> service.validateWeekForSubmission(placement, week))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Chưa có nhật ký ngày được xác nhận");
    }

    @Test
    void testAcademicFollowupRejectsWhenDraftRemains() {
        placement.setSupervisionMode(SupervisionMode.ACADEMIC_FOLLOWUP);
        LocalDate start = placement.getStartDate();
        LocalDate end = start.plusDays(6);

        DailyJournal j1 = new DailyJournal();
        j1.setWorkDate(start);
        j1.setStatus("SUBMITTED");

        DailyJournal j2 = new DailyJournal();
        j2.setWorkDate(start.plusDays(1));
        j2.setStatus("DRAFT");

        when(journals.findByPlacementIdOrderByWorkDateAsc(placement.getId()))
                .thenReturn(List.of(j1, j2));

        DailyJournalService.Week week = new DailyJournalService.Week(
                1, start, end, 1, 0, 1, BigDecimal.valueOf(8),
                "Tasks", "Results", "Reflection", "NOT_SUBMITTED", null);

        assertThatThrownBy(() -> service.validateWeekForSubmission(placement, week))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("nháp");
    }
}
