package com.internlink.core.dto.tracking;

import com.internlink.core.entity.LearningAgreement;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LearningAgreementResponse(
        Long id,
        Long applicationId,
        Long studentId,
        Long academicSupervisorId,
        Long companyMentorId,
        String educationalObjectives,
        String detailedTasks,
        String knowledgeSkillsToAcquire,
        Integer workHoursPerWeek,
        LocalDate startDate,
        LocalDate endDate,
        Integer version,
        String status,
        Boolean studentSigned,
        LocalDateTime studentSignedAt,
        Boolean mentorSigned,
        LocalDateTime mentorSignedAt,
        Boolean supervisorSigned,
        LocalDateTime supervisorSignedAt) {
    public static LearningAgreementResponse fromEntity(LearningAgreement la) {
        return new LearningAgreementResponse(
                la.getId(),
                la.getApplicationId(),
                la.getStudentId(),
                la.getAcademicSupervisorId(),
                la.getCompanyMentorId(),
                la.getEducationalObjectives(),
                la.getDetailedTasks(),
                la.getKnowledgeSkillsToAcquire(),
                la.getWorkHoursPerWeek(),
                la.getStartDate(),
                la.getEndDate(),
                la.getVersion(),
                la.getStatus(),
                la.getStudentSigned(),
                la.getStudentSignedAt(),
                la.getMentorSigned(),
                la.getMentorSignedAt(),
                la.getSupervisorSigned(),
                la.getSupervisorSignedAt());
    }
}