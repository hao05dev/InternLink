package com.internlink.core.dto.tracking;

import com.internlink.core.entity.InternshipIncident;
import java.time.LocalDateTime;

public record IncidentResponse(
        Long id,
        Long learningAgreementId,
        Long reportedByUserId,
        String incidentType,
        String description,
        String studentEvidenceUrl,
        String severity,
        String resolutionStatus,
        String resolutionNotes,
        LocalDateTime reportedAt,
        LocalDateTime resolvedAt) {
    public static IncidentResponse fromEntity(InternshipIncident i) {
        return new IncidentResponse(
                i.getId(),
                i.getLearningAgreementId(),
                i.getReportedByUserId(),
                i.getIncidentType(),
                i.getDescription(),
                i.getStudentEvidenceUrl(),
                i.getSeverity(),
                i.getResolutionStatus(),
                i.getResolutionNotes(),
                i.getReportedAt(),
                i.getResolvedAt());
    }
}