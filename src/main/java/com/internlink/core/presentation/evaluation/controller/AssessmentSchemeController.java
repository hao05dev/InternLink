package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.AssessmentSchemeService;
import com.internlink.core.presentation.evaluation.dto.request.AssessmentSchemeRequest;
import com.internlink.core.presentation.evaluation.dto.response.AssessmentSchemeResponse;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.exception.BadRequestException;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/assessment-schemes") @RequiredArgsConstructor
public class AssessmentSchemeController {
    private static final long MAX_TEMPLATE_BYTES = 5L * 1024 * 1024;
    private final AssessmentSchemeService service;
    private final AiServiceClient aiClient;

    /** Draft only: nothing is persisted. Faculty reviews the result, then calls POST to create the scheme. */
    @PostMapping(value = "/analyze-template", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ApiResponse<Map<String, Object>> analyzeTemplate(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > MAX_TEMPLATE_BYTES) {
            throw new BadRequestException("File mẫu chấm điểm phải có dung lượng từ 1 byte đến 5MB.");
        }
        String name = file.getOriginalFilename() == null ? "template" : file.getOriginalFilename();
        Map<String, Object> result = aiClient.parseRubric(name, Base64.getEncoder().encodeToString(file.getBytes()));
        if ("FAILED".equals(result.get("status"))) {
            throw new BadRequestException("Không phân tích được file mẫu (" + result.get("error_code") + "). Hãy tạo phương án thủ công.");
        }
        return ApiResponse.success(result);
    }
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
