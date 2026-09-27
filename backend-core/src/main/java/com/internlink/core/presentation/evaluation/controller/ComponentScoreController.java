package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.ComponentScoreService;
import com.internlink.core.presentation.evaluation.dto.request.ComponentScoreRequest;
import com.internlink.core.presentation.evaluation.dto.response.ComponentScoreResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/component-scores") @RequiredArgsConstructor
public class ComponentScoreController {
    private final ComponentScoreService service;
    @PostMapping @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'LECTURER')")
    public ApiResponse<ComponentScoreResponse> submit(@Valid @RequestBody ComponentScoreRequest request) {
        return ApiResponse.success(service.submit(request));
    }
    @PatchMapping("/{id}/verify") @PreAuthorize("hasRole('LECTURER')")
    public ApiResponse<ComponentScoreResponse> verify(@PathVariable UUID id) {
        return ApiResponse.success(service.verify(id));
    }
    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ApiResponse<List<ComponentScoreResponse>> byPlacement(@PathVariable UUID placementId) {
        return ApiResponse.success(service.byPlacement(placementId));
    }
}
