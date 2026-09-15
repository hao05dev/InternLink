package com.internlink.core.controller;

import com.internlink.core.dto.recruitment.ApplicationResponse;
import com.internlink.core.dto.recruitment.ApplyJobRequest;
import com.internlink.core.dto.recruitment.OfferDecisionRequest;
import com.internlink.core.dto.recruitment.SendOfferRequest;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.RecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ApplicationController {

    private final RecruitmentService recruitmentService;

    // 1. Sinh viên nộp đơn ứng tuyển
    @PostMapping("/student/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> applyJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ApplyJobRequest request) {
        return ResponseEntity.ok(recruitmentService.applyJob(userDetails.getId(), request));
    }

    // 2. Sinh viên xem các đơn của mình
    @GetMapping("/student/applications/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(recruitmentService.getMyApplications(userDetails.getId()));
    }

    // 3. Doanh nghiệp xem danh sách ứng viên nộp vào job
    @GetMapping("/company/jobs/{jobId}/applications")
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'COMPANY_MENTOR')")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(recruitmentService.getJobApplications(jobId));
    }

    // 4. Doanh nghiệp gửi Offer
    @PostMapping("/company/applications/{applicationId}/offer")
    @PreAuthorize("hasRole('COMPANY_REP')")
    public ResponseEntity<ApplicationResponse> sendOffer(
            @PathVariable Long applicationId,
            @Valid @RequestBody SendOfferRequest request) {
        return ResponseEntity.ok(recruitmentService.sendOffer(applicationId, request));
    }

    // 5. Sinh viên phản hồi Offer (ACCEPTED / REJECTED)
    @PostMapping("/student/applications/{applicationId}/respond-offer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationResponse> respondToOffer(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody OfferDecisionRequest request) {
        return ResponseEntity.ok(recruitmentService.respondToOffer(userDetails.getId(), applicationId, request));
    }
}