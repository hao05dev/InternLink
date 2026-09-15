package com.internlink.core.dto.recruitment;

import com.internlink.core.entity.Interview;
import java.time.LocalDateTime;

public record InterviewResponse(
        Long id,
        Long applicationId,
        String title,
        String interviewType,
        LocalDateTime scheduledStart,
        LocalDateTime scheduledEnd,
        String meetingUrl,
        String locationDetails,
        String status) {
    public static InterviewResponse fromEntity(Interview i) {
        return new InterviewResponse(
                i.getId(),
                i.getApplicationId(),
                i.getTitle(),
                i.getInterviewType(),
                i.getScheduledStart(),
                i.getScheduledEnd(),
                i.getMeetingUrl(),
                i.getLocationDetails(),
                i.getStatus());
    }
}