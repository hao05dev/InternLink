package com.internlink.core.presentation.evaluation.dto.response;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.OffsetDateTime;

public record AssessmentSchemeResponse(UUID id, UUID termId, UUID programId, String cohortCode,
    String courseCode, Integer revision, String sourceReference, List<Map<String, Object>> components,
    Integer requiredLogbookWeeks, Integer weeklyGraceDays, Boolean requireMidtermReport, Boolean requireFinalReport,
    OffsetDateTime midtermReportDueAt, OffsetDateTime finalReportDueAt, String status) {}
