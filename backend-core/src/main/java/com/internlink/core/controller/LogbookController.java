package com.internlink.core.controller;

import com.internlink.core.dto.tracking.LogbookRequest;
import com.internlink.core.dto.tracking.LogbookResponse;
import com.internlink.core.dto.tracking.LogbookReviewRequest;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.InternshipTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/logbooks")
@RequiredArgsConstructor
public class LogbookController {

    private final InternshipTrackingService trackingService;

    @PostMapping("/student/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LogbookResponse> submitLogbook(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody LogbookRequest request) {
        return ResponseEntity.ok(trackingService.submitLogbook(userDetails.getId(), request));
    }

    @PostMapping("/mentor/{id}/review")
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'COMPANY_REP')")
    public ResponseEntity<LogbookResponse> reviewLogbook(
            @PathVariable Long id,
            @Valid @RequestBody LogbookReviewRequest request) {
        return ResponseEntity.ok(trackingService.reviewLogbookByMentor(id, request));
    }
}