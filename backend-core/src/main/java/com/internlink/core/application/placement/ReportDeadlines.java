package com.internlink.core.application.placement;

import com.internlink.core.domain.placement.InternshipPlacement;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Map;

/** Shared deadline rule for late flags, portfolio metadata and reminder SQL. */
public final class ReportDeadlines {
    private ReportDeadlines() {}

    public static OffsetDateTime extension(InternshipPlacement placement) {
        if (placement.getWorkSchedule() != null
                && placement.getWorkSchedule().get("extension") instanceof Map<?, ?> values
                && values.get("reportDueAt") instanceof String value) {
            try {
                return OffsetDateTime.parse(value);
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    public static OffsetDateTime due(InternshipPlacement placement, String type) {
        var scheme = placement.getAssessmentScheme();
        if ("MIDTERM".equals(type)) return scheme == null ? null : scheme.getMidtermReportDueAt();
        var extended = extension(placement);
        if (extended != null) return extended;
        if (scheme != null && scheme.getFinalReportDueAt() != null)
            return scheme.getFinalReportDueAt();
        return placement.getTerm() == null ? null : placement.getTerm().getEvaluationDeadline();
    }
}
