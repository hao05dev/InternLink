package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.AssessmentSchemeService;
import com.internlink.core.presentation.evaluation.dto.request.AssessmentSchemeRequest;
import com.internlink.core.presentation.evaluation.dto.response.AssessmentSchemeResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/assessment-schemes") @RequiredArgsConstructor
public class AssessmentSchemeController {
    private final AssessmentSchemeService service;
    @PostMapping @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ApiResponse<AssessmentSchemeResponse> create(@Valid @RequestBody AssessmentSchemeRequest request) {
        return ApiResponse.success(service.create(request));
    }
    @PatchMapping("/{id}/approve") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ApiResponse<AssessmentSchemeResponse> approve(@PathVariable UUID id) {
        return ApiResponse.success(service.approve(id));
    }
    @PatchMapping("/{id}/retire") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ApiResponse<AssessmentSchemeResponse> retire(@PathVariable UUID id) {
        return ApiResponse.success(service.retire(id));
    }
    @GetMapping("/term/{termId}") @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ApiResponse<List<AssessmentSchemeResponse>> byTerm(@PathVariable UUID termId) {
        return ApiResponse.success(service.byTerm(termId));
    }
    @PatchMapping("/placement/{placementId}/bind/{schemeId}")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ApiResponse<AssessmentSchemeResponse> bind(@PathVariable UUID placementId, @PathVariable UUID schemeId) {
        return ApiResponse.success(service.bind(placementId, schemeId));
    }
    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ApiResponse<AssessmentSchemeResponse> forPlacement(@PathVariable UUID placementId) {
        return ApiResponse.success(service.forPlacement(placementId));
    }
}
