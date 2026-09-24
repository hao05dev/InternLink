package com.internlink.core.presentation.placement.controller;

import com.internlink.core.application.placement.InternshipPlacementService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.placement.dto.response.InternshipPlacementResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.PlacementStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/placements")
@RequiredArgsConstructor
public class InternshipPlacementController {

    private final InternshipPlacementService placementService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<InternshipPlacementResponse>> getPlacementById(@PathVariable UUID id) {
        InternshipPlacementResponse response = placementService.getPlacementById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-placement")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<InternshipPlacementResponse>>> getMyPlacements(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        List<InternshipPlacementResponse> list = placementService.getPlacementsByStudent(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/mentor/my-students")
    @PreAuthorize("hasRole('COMPANY_MENTOR')")
    public ResponseEntity<ApiResponse<List<InternshipPlacementResponse>>> getMentorPlacements(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        List<InternshipPlacementResponse> list = placementService.getPlacementsByMentor(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/lecturer/my-students")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<List<InternshipPlacementResponse>>> getLecturerPlacements(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        List<InternshipPlacementResponse> list = placementService.getPlacementsByLecturer(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<List<InternshipPlacementResponse>>> getPlacementsByTerm(
        @PathVariable UUID termId
    ) {
        List<InternshipPlacementResponse> list = placementService.getPlacementsByTerm(termId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<InternshipPlacementResponse>> activatePlacement(
        @RequestParam UUID agreementId,
        @RequestParam UUID lecturerId
    ) {
        InternshipPlacementResponse response = placementService.activatePlacementFromAgreement(agreementId, lecturerId);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Kích hoạt lần thực tập thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<InternshipPlacementResponse>> updateStatus(
        @PathVariable UUID id,
        @RequestParam PlacementStatus status
    ) {
        InternshipPlacementResponse response = placementService.updatePlacementStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thực tập thành công", response));
    }
}