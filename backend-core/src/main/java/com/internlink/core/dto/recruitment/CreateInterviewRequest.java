package com.internlink.core.dto.recruitment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record CreateInterviewRequest(
        @NotNull(message = "Application ID is required") Long applicationId,

        @NotBlank(message = "Title is required") String title,

        String interviewType,

        @NotNull(message = "Scheduled start time is required") LocalDateTime scheduledStart,

        LocalDateTime scheduledEnd,
        String meetingUrl,
        String locationDetails,
        String notes,
        List<Long> interviewerUserIds // Danh sách User ID của các Mentor/HR tham gia phỏng vấn
) {
}