package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.PaperEvaluationService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.evaluation.dto.request.PaperEvaluationOverrideRequest;
import com.internlink.core.presentation.evaluation.dto.response.RubricEvaluationResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class PaperEvaluationController {

    private final PaperEvaluationService paperEvaluationService;

    @PostMapping("/paper-override")
    @PreAuthorize("hasAnyRole('LECTURER', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<RubricEvaluationResponse>> savePaperEvaluation(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody PaperEvaluationOverrideRequest request
    ) {
        RubricEvaluationResponse response = paperEvaluationService.savePaperEvaluation(userDetail.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận và số hóa phiếu đánh giá cơ quan thành công", response));
    }
}
