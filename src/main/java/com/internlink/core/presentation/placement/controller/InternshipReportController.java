package com.internlink.core.presentation.placement.controller;

import com.internlink.core.application.placement.InternshipReportService;
import com.internlink.core.presentation.placement.dto.response.InternshipReportResponse;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/internship-reports") @RequiredArgsConstructor
public class InternshipReportController {
    private final InternshipReportService service;
    @PostMapping("/placement/{placementId}") @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<InternshipReportResponse> submit(@PathVariable UUID placementId,
        @RequestParam String type, @RequestParam UUID documentId) {
        return ApiResponse.success(service.submit(placementId, type, documentId));
    }
    @PatchMapping("/{id}/review") @PreAuthorize("hasRole('LECTURER')")
    public ApiResponse<InternshipReportResponse> review(@PathVariable UUID id,
        @RequestParam String decision, @RequestParam(required = false) String feedback) {
        return ApiResponse.success(service.review(id, decision, feedback));
    }
    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ApiResponse<List<InternshipReportResponse>> byPlacement(@PathVariable UUID placementId) {
        return ApiResponse.success(service.byPlacement(placementId));
    }
}
