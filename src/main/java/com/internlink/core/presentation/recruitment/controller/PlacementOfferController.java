package com.internlink.core.presentation.recruitment.controller;

import com.internlink.core.application.recruitment.PlacementOfferService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.presentation.recruitment.dto.response.PlacementOfferResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.OfferStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class PlacementOfferController {

    private final PlacementOfferService offerService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_REP', 'ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<PlacementOfferResponse>> getOfferById(@PathVariable UUID id) {
        PlacementOfferResponse offer = offerService.getOfferById(id);
        return ResponseEntity.ok(ApiResponse.success(offer));
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_REP', 'ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<PlacementOfferResponse>> getOfferByApplicationId(@PathVariable UUID applicationId) {
        PlacementOfferResponse offer = offerService.getOfferByApplicationId(applicationId);
        return ResponseEntity.ok(ApiResponse.success(offer));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'ADMIN')")
    public ResponseEntity<ApiResponse<PlacementOfferResponse>> createOffer(
        @Valid @RequestBody PlacementOfferRequest request
    ) {
        PlacementOfferResponse response = offerService.createOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Phát hành đề nghị tiếp nhận (Offer) thành công", response));
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PlacementOfferResponse>> respondToOffer(
        @PathVariable UUID id,
        @RequestParam OfferStatus status
    ) {
        PlacementOfferResponse response = offerService.respondToOffer(id, status);
        return ResponseEntity.ok(ApiResponse.success("Phản hồi Offer thành công", response));
    }
}
