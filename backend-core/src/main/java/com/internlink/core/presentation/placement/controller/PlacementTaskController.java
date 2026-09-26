package com.internlink.core.presentation.placement.controller;

import com.internlink.core.application.placement.PlacementTaskService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.placement.dto.request.PlacementTaskRequest;
import com.internlink.core.presentation.placement.dto.response.PlacementTaskResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.TaskStatus;
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
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class PlacementTaskController {

    private final PlacementTaskService taskService;

    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PlacementTaskResponse>>> getTasksByPlacement(
        @PathVariable UUID placementId
    ) {
        List<PlacementTaskResponse> tasks = taskService.getTasksByPlacement(placementId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<PlacementTaskResponse>> getTaskById(@PathVariable UUID id) {
        PlacementTaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<PlacementTaskResponse>> createTask(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody PlacementTaskRequest request
    ) {
        PlacementTaskResponse response = taskService.createTask(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Giao nhiệm vụ thực tập thành công", response));
    }

    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PlacementTaskResponse>> submitTask(
        @PathVariable UUID id,
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @RequestBody String submissionSummary
    ) {
        PlacementTaskResponse response = taskService.submitTask(id, userDetail.getId(), submissionSummary);
        return ResponseEntity.ok(ApiResponse.success("Nộp báo cáo nhiệm vụ thành công", response));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<PlacementTaskResponse>> reviewTask(
        @PathVariable UUID id,
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @RequestParam TaskStatus status,
        @RequestParam(required = false) String mentorFeedback,
        @RequestParam(required = false) Integer progressPercent
    ) {
        PlacementTaskResponse response = taskService.reviewTask(id, userDetail.getId(), status, mentorFeedback, progressPercent);
        return ResponseEntity.ok(ApiResponse.success("Đánh giá nhiệm vụ thành công", response));
    }
}
