package com.internlink.core.dto.tracking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record LogbookRequest(
        @NotNull(message = "Agreement ID is required") Long learningAgreementId,

        @NotNull(message = "Week number is required") @Min(value = 1, message = "Week number must be at least 1") Integer weekNumber,

        @NotNull(message = "Start date is required") LocalDate startDate,

        @NotNull(message = "End date is required") LocalDate endDate,

        @NotBlank(message = "Tasks performed are required") String tasksPerformed,

        String learnedSkills,
        String evidenceUrl,
        Double hoursLogged) {
}