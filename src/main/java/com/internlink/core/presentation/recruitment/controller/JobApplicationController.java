package com.internlink.core.presentation.recruitment.controller;

import com.internlink.core.application.recruitment.JobApplicationService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobApplicationResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.ApplicationStatus;
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
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService applicationService;

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getMyApplications(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        List<JobApplicationResponse> applications = applicationService.getApplicationsByStudent(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> getApplicationsByJob(
        @PathVariable UUID jobId
    ) {
        List<JobApplicationResponse> applications = applicationService.getApplicationsByJob(jobId);
        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_REP', 'ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> getApplicationById(
        @PathVariable UUID id
    ) {
        JobApplicationResponse application = applicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success(application));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> applyJob(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody JobApplicationRequest request
    ) {
        JobApplicationResponse response = applicationService.applyJob(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Nộp hồ sơ ứng tuyển thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'ADMIN')")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateStatus(
        @PathVariable UUID id,
        @RequestParam ApplicationStatus status
    ) {
        JobApplicationResponse response = applicationService.updateApplicationStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn ứng tuyển thành công", response));
    }

    @PatchMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> withdraw(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.withdrawApplication(id)));
    }
}
