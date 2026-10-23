package com.internlink.core.application.analytics;

import com.internlink.core.presentation.analytics.dto.response.InternshipAnalyticsResponse;

import java.util.UUID;

public interface InternshipAnalyticsService {
    InternshipAnalyticsResponse getTermAnalytics(UUID termId);
}
