package com.internlink.core.presentation.analytics.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternshipAnalyticsResponse {

    private UUID termId;
    private String termName;
    private int totalStudents;
    private int placedStudents;
    private double placementRate;
    private double averageTimeToOfferDays;
    private double satisfactionRating;

    private ApplicationFunnel funnel;
    private List<SkillDemandItem> topDemandedSkills;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationFunnel {
        private long applied;
        private long interviewing;
        private long offered;
        private long placed;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDemandItem {
        private String skillName;
        private long jobCount;
        private double percentage;
    }
}
