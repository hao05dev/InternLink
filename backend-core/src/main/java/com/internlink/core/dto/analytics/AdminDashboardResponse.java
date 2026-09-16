package com.internlink.core.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private long totalStudents;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;
    private long totalLearningAgreements;
    private long totalIncidentsReported;
    private double overallPlacementRate; // Tỷ lệ SV đã có nơi thực tập (%)
    private Map<String, Long> applicationsByStatus;
    private Map<String, Double> averageNaceScores; // Điểm trung bình 8 nhóm năng lực NACE
}