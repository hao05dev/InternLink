package com.internlink.core.dto.tracking;

import com.internlink.core.entity.Logbook;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LogbookResponse(
        Long id,
        Long learningAgreementId,
        Integer weekNumber,
        LocalDate startDate,
        LocalDate endDate,
        String tasksPerformed,
        String learnedSkills,
        String evidenceUrl,
        Double hoursLogged,
        String status,
        String mentorFeedback,
        Integer mentorRating,
        String supervisorNotes,
        LocalDateTime submittedAt) {
    public static LogbookResponse fromEntity(Logbook l) {
        return new LogbookResponse(
                l.getId(),
                l.getLearningAgreementId(),
                l.getWeekNumber(),
                l.getStartDate(),
                l.getEndDate(),
                l.getTasksPerformed(),
                l.getLearnedSkills(),
                l.getEvidenceUrl(),
                l.getHoursLogged(),
                l.getStatus(),
                l.getMentorFeedback(),
                l.getMentorRating(),
                l.getSupervisorNotes(),
                l.getSubmittedAt());
    }
}