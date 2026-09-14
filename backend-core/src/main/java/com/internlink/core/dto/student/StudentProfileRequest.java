package com.internlink.core.dto.student;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record StudentProfileRequest(
        @NotBlank(message = "Student code is required") String studentCode,

        @NotBlank(message = "Major is required") String major,

        String academicYear,
        Double gpa,
        Integer passedCredits,
        String cvFileUrl,
        String portfolioUrl,
        String githubUrl,
        String linkedinUrl,
        String bioSummary,
        Long preferredProvinceId,
        String desiredPosition,
        String preferredWorkFormat,
        List<StudentSkillDto> skills) {
}