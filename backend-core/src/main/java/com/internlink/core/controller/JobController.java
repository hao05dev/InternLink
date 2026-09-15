package com.internlink.core.controller;

import com.internlink.core.dto.job.JobApprovalRequest;
import com.internlink.core.dto.job.JobRequest;
import com.internlink.core.dto.job.JobResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // --- 1. PUBLIC ENDPOINTS (SINH VIÊN & KHÁCH XEM TIN ĐÃ DUYỆT) ---
    @GetMapping("/public/jobs")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String major,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, major, pageable));
    }

    @GetMapping("/public/jobs/{id}")
    public ResponseEntity<JobResponse> getJobDetail(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobDetail(id));
    }

    // --- 2. COMPANY REP ENDPOINTS (DOANH NGHIỆP QUẢN LÝ TIN) ---
    @PostMapping("/company/jobs")
    @PreAuthorize("hasRole('COMPANY_REP')")
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.createJob(userDetails.getId(), request));
    }

    @GetMapping("/company/jobs/my")
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'COMPANY_MENTOR')")
    public ResponseEntity<List<JobResponse>> getMyJobs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getMyCompanyJobs(userDetails.getId()));
    }

    // --- 3. FACULTY ADMIN ENDPOINTS (KHOA PHÊ DUYỆT TIN) ---
    @GetMapping("/faculty/jobs/pending")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<List<JobResponse>> getPendingJobs() {
        return ResponseEntity.ok(jobService.getPendingJobs());
    }

    @PostMapping("/faculty/jobs/{id}/review")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<JobResponse> reviewJob(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JobApprovalRequest request) {
        return ResponseEntity.ok(jobService.reviewJob(id, userDetails.getId(), request));
    }
}