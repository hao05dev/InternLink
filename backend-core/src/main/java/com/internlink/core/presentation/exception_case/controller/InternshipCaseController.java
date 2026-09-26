package com.internlink.core.presentation.exception_case.controller;

import com.internlink.core.application.exception_case.InternshipCaseService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.exception_case.dto.request.InternshipCaseRequest;
import com.internlink.core.presentation.exception_case.dto.response.InternshipCaseResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.CaseStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
public class InternshipCaseController {

    private final InternshipCaseService caseService;

    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<InternshipCaseResponse>>> getCasesByPlacement(
        @PathVariable UUID placementId
    ) {
        List<InternshipCaseResponse> list = caseService.getCasesByPlacement(placementId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<InternshipCaseResponse>> getCaseById(@PathVariable UUID id) {
        InternshipCaseResponse response = caseService.getCaseById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<InternshipCaseResponse>> reportCase(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody InternshipCaseRequest request
    ) {
        InternshipCaseResponse response = caseService.reportCase(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Báo cáo sự cố/ngoại lệ thực tập thành công", response));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<InternshipCaseResponse>> resolveCase(
        @PathVariable UUID id,
        @RequestParam CaseStatus status,
        @RequestBody(required = false) Map<String, Object> resolution,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        InternshipCaseResponse response = caseService.resolveCase(id, userDetail.getId(), status, resolution);
        return ResponseEntity.ok(ApiResponse.success("Xử lý và cập nhật biên bản sự cố thành công", response));
    }
}