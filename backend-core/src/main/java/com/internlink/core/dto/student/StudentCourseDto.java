package com.internlink.core.dto.student;

import jakarta.validation.constraints.NotBlank;

public record StudentCourseDto(
        @NotBlank(message = "Course code is required") String courseCode,

        @NotBlank(message = "Course name is required") String courseName,

        Double grade,
        Integer credits,
        String semester) {
}