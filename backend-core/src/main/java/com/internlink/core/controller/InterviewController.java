package com.internlink.core.controller;

import com.internlink.core.dto.recruitment.CreateInterviewRequest;
import com.internlink.core.dto.recruitment.InterviewResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.RecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/company/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final RecruitmentService recruitmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'COMPANY_MENTOR')")
    public ResponseEntity<InterviewResponse> scheduleInterview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateInterviewRequest request) {
        return ResponseEntity.ok(recruitmentService.scheduleInterview(userDetails.getId(), request));
    }
}