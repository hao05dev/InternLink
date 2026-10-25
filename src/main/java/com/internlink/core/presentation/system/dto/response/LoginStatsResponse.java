package com.internlink.core.presentation.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginStatsResponse {

    private long todayLogins;
    private long todaySuccessfulLogins;
    private long todayFailedLogins;
    private long todayUniqueUsers;
    private long activeSessionsCount;

    @Builder.Default
    private List<DailyLoginStatDto> dailyStats = List.of();

    @Builder.Default
    private Map<String, Long> roleBreakdown = Map.of();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyLoginStatDto {
        private String date;
        private long totalLogins;
        private long successfulLogins;
        private long failedLogins;
        private long uniqueUsers;
    }
}
