package com.internlink.core.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDashboardResponse {

    private Long studentProfileId;
    private String studentCode;
    private String internshipStatus; // LOOKING_FOR_JOB, APPLIED, INTERNING, COMPLETED
    private Long activeAgreementId;
    private String companyName;
    private String mentorName;
    private String supervisorName;
    private int completedLogbooksCount;
    private double averageEvaluationScore; // Điểm trung bình các phiếu Rubric
    private long unreadNotificationsCount;
}