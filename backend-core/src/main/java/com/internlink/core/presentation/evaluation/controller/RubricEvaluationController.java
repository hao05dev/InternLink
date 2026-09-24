package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.RubricEvaluationService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.evaluation.dto.request.RubricEvaluationRequest;
import com.internlink.core.presentation.evaluation.dto.response.RubricEvaluationResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class RubricEvaluationController {

    private final RubricEvaluationService evaluationService;

    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<RubricEvaluationResponse>>> getEvaluationsByPlacement(
        @PathVariable UUID placementId
    ) {
        List<RubricEvaluationResponse> list = evaluationService.getEvaluationsByPlacement(placementId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<RubricEvaluationResponse>> getEvaluationById(
        @PathVariable UUID id
    ) {
        RubricEvaluationResponse response = evaluationService.getEvaluationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RubricEvaluationResponse>> submitEvaluation(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody RubricEvaluationRequest request
    ) {
        RubricEvaluationResponse response = evaluationService.submitEvaluation(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Gửi đánh giá Rubric thành công", response));
    }
}