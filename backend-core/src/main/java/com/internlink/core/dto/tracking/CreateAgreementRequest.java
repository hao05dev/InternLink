package com.internlink.core.dto.tracking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateAgreementRequest(
        @NotNull(message = "Application ID is required") Long applicationId,

        @NotNull(message = "Academic supervisor user ID is required") Long academicSupervisorId,

        @NotNull(message = "Company mentor user ID is required") Long companyMentorId,

        @NotBlank(message = "Educational objectives are required") String educationalObjectives,

        @NotBlank(message = "Detailed tasks are required") String detailedTasks,

        String knowledgeSkillsToAcquire,
        Integer workHoursPerWeek,

        @NotNull(message = "Start date is required") LocalDate startDate,

        @NotNull(message = "End date is required") LocalDate endDate) {
}