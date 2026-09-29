package com.internlink.core.presentation.ai_matching.controller;

import com.internlink.core.application.ai_matching.AdminAiService;
import com.internlink.core.presentation.ai_matching.dto.request.AiRetryRequest;
import com.internlink.core.presentation.ai_matching.dto.response.AdminAiResponse.*;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.enums.AiRunType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/ai")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAiController {
    private final AdminAiService service;

    @GetMapping("/stats")
    public ApiResponse<Stats> stats() { return ApiResponse.success(service.stats()); }

    @GetMapping("/health")
    public ApiResponse<Health> health() { return ApiResponse.success(service.health()); }

    @GetMapping("/runs")
    public ApiResponse<RunPage> runs(@RequestParam(required = false) AiRunStatus status,
            @RequestParam(required = false) AiRunType type, @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.runs(status, type, search, page, size));
    }

    @GetMapping("/runs/{id}")
    public ApiResponse<Detail> detail(@PathVariable UUID id) { return ApiResponse.success(service.detail(id)); }

    @PostMapping("/runs/{id}/retry")
    public ApiResponse<Detail> retry(@PathVariable UUID id, @Valid @RequestBody AiRetryRequest request) {
        return ApiResponse.success(service.retry(id, request.cvText()));
    }

    @GetMapping("/taxonomy")
    public ApiResponse<List<Taxonomy>> taxonomy() { return ApiResponse.success(service.taxonomy()); }
}
