package com.internlink.core.dto.recruitment;

import com.internlink.core.entity.Application;
import java.time.LocalDateTime;

public record ApplicationResponse(
        Long id,
        Long studentProfileId,
        String studentName,
        String studentCode,
        Long jobId,
        String jobTitle,
        String companyName,
        String coverLetter,
        Double aiMatchScore,
        String status,
        String offerDetails,
        LocalDateTime offerDeadline,
        LocalDateTime appliedAt) {
    public static ApplicationResponse of(
            Application app,
            String studentName,
            String studentCode,
            String jobTitle,
            String companyName) {
        return new ApplicationResponse(
                app.getId(),
                app.getStudentProfileId(),
                studentName,
                studentCode,
                app.getJobId(),
                jobTitle,
                companyName,
                app.getCoverLetter(),
                app.getAiMatchScore(),
                app.getStatus(),
                app.getOfferDetails(),
                app.getOfferDeadline(),
                app.getAppliedAt());
    }
}