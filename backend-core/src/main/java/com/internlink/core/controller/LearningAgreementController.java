package com.internlink.core.controller;

import com.internlink.core.dto.tracking.CreateAgreementRequest;
import com.internlink.core.dto.tracking.LearningAgreementResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.InternshipTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agreements")
@RequiredArgsConstructor
public class LearningAgreementController {

    private final InternshipTrackingService trackingService;

    @PostMapping
    public ResponseEntity<LearningAgreementResponse> createAgreement(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateAgreementRequest request) {
        return ResponseEntity.ok(trackingService.createAgreement(userDetails.getId(), request));
    }

    @PostMapping("/{id}/sign")
    public ResponseEntity<LearningAgreementResponse> signAgreement(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(trackingService.signAgreement(id, userDetails.getId(), userDetails.getRoleName()));
    }
}