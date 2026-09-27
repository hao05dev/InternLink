package com.internlink.core.presentation.placement.controller;

import com.internlink.core.application.placement.WeeklyLogbookService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.placement.dto.request.WeeklyLogbookRequest;
import com.internlink.core.presentation.placement.dto.response.WeeklyLogbookResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.LogbookStatus;
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
@RequestMapping("/api/v1/logbooks")
@RequiredArgsConstructor
public class WeeklyLogbookController {

    private final WeeklyLogbookService logbookService;

    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<WeeklyLogbookResponse>>> getLogbooksByPlacement(
        @PathVariable UUID placementId
    ) {
        List<WeeklyLogbookResponse> logbooks = logbookService.getLogbooksByPlacement(placementId);
        return ResponseEntity.ok(ApiResponse.success(logbooks));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<WeeklyLogbookResponse>> submitLogbook(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody WeeklyLogbookRequest request
    ) {
        WeeklyLogbookResponse response = logbookService.submitLogbook(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Nộp nhật ký thực tập tuần thành công", response));
    }

    @PatchMapping("/{id}/mentor-review")
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<WeeklyLogbookResponse>> reviewByMentor(
        @PathVariable UUID id,
        @RequestParam LogbookStatus status,
        @RequestParam(required = false) String mentorFeedback,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        WeeklyLogbookResponse response = logbookService.reviewByMentor(id, userDetail.getId(), status, mentorFeedback);
        return ResponseEntity.ok(ApiResponse.success("Mentor nhận xét nhật ký tuần thành công", response));
    }

    @PatchMapping("/{id}/lecturer-comment")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WeeklyLogbookResponse>> commentByLecturer(
        @PathVariable UUID id,
        @RequestParam String lecturerComment,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        WeeklyLogbookResponse response = logbookService.commentByLecturer(id, userDetail.getId(), lecturerComment);
        return ResponseEntity.ok(ApiResponse.success("GVHD nhận xét nhật ký tuần thành công", response));
    }

    @PatchMapping("/{id}/lecturer-review")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<WeeklyLogbookResponse>> reviewByLecturer(
        @PathVariable UUID id, @RequestParam LogbookStatus status,
        @RequestParam(required = false) String feedback,
        @AuthenticationPrincipal CustomUserDetail userDetail) {
        return ResponseEntity.ok(ApiResponse.success(logbookService.reviewByLecturer(id, userDetail.getId(), status, feedback)));
    }
}
