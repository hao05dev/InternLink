package com.internlink.core.presentation.evaluation.controller;

import com.internlink.core.application.evaluation.FinalResultService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/final-results")
@RequiredArgsConstructor
public class FinalResultController {

    private final FinalResultService finalResultService;

    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<FinalResultResponse>> getFinalResultByPlacement(
        @PathVariable UUID placementId
    ) {
        FinalResultResponse response = finalResultService.getFinalResultByPlacement(placementId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<FinalResultResponse>> finalizeResult(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody FinalResultRequest request
    ) {
        FinalResultResponse response = finalResultService.calculateAndFinalizeResult(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Tổng hợp và công bố điểm tổng kết đợt thực tập thành công", response));
    }
}