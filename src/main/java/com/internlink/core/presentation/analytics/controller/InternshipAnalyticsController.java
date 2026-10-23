package com.internlink.core.presentation.analytics.controller;

import com.internlink.core.application.analytics.InternshipAnalyticsService;
import com.internlink.core.presentation.analytics.dto.response.InternshipAnalyticsResponse;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics/internship")
@RequiredArgsConstructor
public class InternshipAnalyticsController {

    private final InternshipAnalyticsService analyticsService;

    @GetMapping("/term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<InternshipAnalyticsResponse>> getTermAnalytics(
        @PathVariable UUID termId
    ) {
        InternshipAnalyticsResponse response = analyticsService.getTermAnalytics(termId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
