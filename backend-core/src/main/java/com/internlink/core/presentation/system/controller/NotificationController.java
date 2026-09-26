package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.system.dto.response.NotificationResponse;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        List<NotificationResponse> list = notificationService.getMyNotifications(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> countUnread(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        long count = notificationService.countUnreadNotifications(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
        @PathVariable UUID id,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        NotificationResponse response = notificationService.markAsRead(id, userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success("Đánh dấu đã đọc thông báo", response));
    }
}
