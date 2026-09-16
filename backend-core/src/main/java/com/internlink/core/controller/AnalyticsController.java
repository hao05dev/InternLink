package com.internlink.core.controller;

import com.internlink.core.dto.analytics.AdminDashboardResponse;
import com.internlink.core.dto.analytics.StudentDashboardResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // 1. Dashboard số liệu tổng quan dành cho Quản trị viên & Ban chủ nhiệm Khoa
    @GetMapping("/admin-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(analyticsService.getAdminDashboardMetrics());
    }

    // 2. Dashboard tiến độ thực tập dành cho Sinh viên
    @GetMapping("/student-dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(analyticsService.getStudentDashboardMetrics(userDetails.getId()));
    }
}