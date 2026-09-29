package com.internlink.core.presentation.recruitment.controller;

import com.internlink.core.application.recruitment.JobPositionService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.JobStatus;
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
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobPositionController {

    private final JobPositionService jobPositionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<JobPositionResponse>>> getAllJobs(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) UUID termId,
        @RequestParam(required = false) UUID companyId
    ) {
        List<JobPositionResponse> jobs = jobPositionService.getAllJobs(keyword, termId, companyId);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/public/term/{termId}")
    public ResponseEntity<ApiResponse<List<JobPositionResponse>>> getApprovedJobsByTerm(
        @PathVariable UUID termId,
        @RequestParam(required = false) String keyword
    ) {
        List<JobPositionResponse> jobs = jobPositionService.getApprovedJobs(termId, keyword);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/public/all")
    public ResponseEntity<ApiResponse<List<JobPositionResponse>>> getPublicJobs(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) UUID termId,
        @RequestParam(required = false) UUID companyId
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobPositionService.getPublicJobs(keyword, termId, companyId)));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<ApiResponse<JobPositionResponse>> getPublicJobById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobPositionService.getPublicJobById(id)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPositionResponse>> getJobById(@PathVariable UUID id) {
        JobPositionResponse job = jobPositionService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(job));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_REP')")
    public ResponseEntity<ApiResponse<JobPositionResponse>> createJob(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody JobPositionRequest request
    ) {
        JobPositionResponse response = jobPositionService.createJob(request, userDetail.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Đăng tin tuyển dụng thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY_REP')")
    public ResponseEntity<ApiResponse<JobPositionResponse>> updateJob(
        @PathVariable UUID id,
        @Valid @RequestBody JobPositionRequest request
    ) {
        JobPositionResponse response = jobPositionService.updateJob(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vị trí thực tập thành công", response));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasRole('COMPANY_REP')")
    public ResponseEntity<ApiResponse<JobPositionResponse>> submitJob(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(jobPositionService.submitJob(id)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<JobPositionResponse>> reviewJob(
        @PathVariable UUID id,
        @RequestParam JobStatus status,
        @RequestParam(required = false) String feedback,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        JobPositionResponse response = jobPositionService.reviewJob(id, status, feedback, userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success("Thẩm định vị trí thực tập thành công", response));
    }
}
