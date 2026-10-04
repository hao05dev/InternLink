package com.internlink.core.application.placement;

import static org.assertj.core.api.Assertions.*;

import com.internlink.core.domain.evaluation.AssessmentScheme;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.placement.InternshipPlacement;

import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Map;

class ReportDeadlinesTest {
    @Test
    void extensionOverridesFinalDeadlineButNotMidterm() {
        var now = OffsetDateTime.now();
        var p =
                InternshipPlacement.builder()
                        .assessmentScheme(
                                AssessmentScheme.builder()
                                        .midtermReportDueAt(now)
                                        .finalReportDueAt(now.plusDays(1))
                                        .build())
                        .workSchedule(
                                Map.of(
                                        "extension",
                                        Map.of("reportDueAt", now.plusDays(3).toString())))
                        .build();
        assertThat(ReportDeadlines.due(p, "FINAL")).isEqualTo(now.plusDays(3));
        assertThat(ReportDeadlines.due(p, "MIDTERM")).isEqualTo(now);
    }

    @Test
    void malformedLegacyExtensionFallsBackToSchemeOrTerm() {
        var now = OffsetDateTime.now();
        var p =
                InternshipPlacement.builder()
                        .term(InternshipTerm.builder().evaluationDeadline(now).build())
                        .workSchedule(Map.of("extension", Map.of("reportDueAt", "invalid")))
                        .build();
        assertThat(ReportDeadlines.due(p, "FINAL")).isEqualTo(now);
    }
}
