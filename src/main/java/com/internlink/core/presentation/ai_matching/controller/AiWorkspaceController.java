package com.internlink.core.presentation.ai_matching.controller;

import com.internlink.core.application.ai_matching.impl.AiWorkspaceService;
import com.internlink.core.application.ai_matching.impl.CvJdAnalysisService;
import com.internlink.core.presentation.ai_matching.dto.request.CvExtractionRequest;
import com.internlink.core.presentation.ai_matching.dto.request.CvJdAnalysisRequest;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ai-workspace")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AiWorkspaceController {
    private final AiWorkspaceService service;
    private final CvJdAnalysisService cvJdAnalysis;
    public record Declaration(@NotBlank @Size(max=2000) String evidence) {}
    public record LearningRequest(@NotEmpty @Size(max=3) List<@NotBlank String> skillIds, @Min(1) @Max(20) int hoursPerWeek) {}

    @GetMapping("/options")
    public ApiResponse<Map<String, Object>> options() { return ApiResponse.success(service.options()); }

    @PostMapping("/cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Map<String, Object>> extract(@Valid @RequestBody CvExtractionRequest request) {
        return ApiResponse.success(service.extractCv(request));
    }

    @PostMapping("/cv-jd-analysis")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Map<String, Object>> analyzeCvJd(@Valid @RequestBody CvJdAnalysisRequest request) {
        return ApiResponse.success(cvJdAnalysis.analyze(request));
    }

    @PutMapping("/skills/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<StudentSkillResponse> declare(@PathVariable String id, @Valid @RequestBody Declaration request) {
        return ApiResponse.success(service.declareSkill(id, request.evidence()));
    }

    @PostMapping("/jobs/{id}/review")
    @PreAuthorize("hasAnyRole('COMPANY_REP','FACULTY_ADMIN','ADMIN')")
    public ApiResponse<Map<String, Object>> review(@PathVariable UUID id) { return ApiResponse.success(service.reviewJob(id)); }

    @PostMapping("/placements/{id}/summary")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER','COMPANY_MENTOR','FACULTY_ADMIN','ADMIN')")
    public ApiResponse<Map<String, Object>> summary(@PathVariable UUID id) { return ApiResponse.success(service.summarize(id)); }

    @PostMapping("/learning-plan")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<Map<String, Object>> plan(@Valid @RequestBody LearningRequest request) {
        return ApiResponse.success(service.learningPlan(request.skillIds(), request.hoursPerWeek()));
    }

    @GetMapping("/terms/{id}/skill-gaps")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN','ADMIN')")
    public ApiResponse<Map<String, Object>> gaps(@PathVariable UUID id) { return ApiResponse.success(service.skillGaps(id)); }
}
