package com.internlink.core.controller;

import com.internlink.core.dto.tracking.IncidentRequest;
import com.internlink.core.dto.tracking.IncidentResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.InternshipTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final InternshipTrackingService trackingService;

    @PostMapping
    public ResponseEntity<IncidentResponse> reportIncident(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody IncidentRequest request) {
        return ResponseEntity.ok(trackingService.reportIncident(userDetails.getId(), request));
    }
}