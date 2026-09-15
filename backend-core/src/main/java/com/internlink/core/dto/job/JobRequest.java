package com.internlink.core.dto.job;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record JobRequest(
        @NotBlank(message = "Job title is required") String title,

        @NotBlank(message = "Description is required") String description,

        String targetMajor,
        String locationRaw,
        String workFormat,

        @Min(value = 1, message = "Slots must be at least 1") Integer slots,

        String stipendRange,
        String benefits,
        String expectedLearningOutcomes,
        List<JobSkillDto> skills) {
}