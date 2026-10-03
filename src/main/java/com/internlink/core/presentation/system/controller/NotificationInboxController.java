package com.internlink.core.presentation.system.controller;
import com.internlink.core.application.system.impl.NotificationServiceImpl;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/notifications") @RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationInboxController {
    private final NotificationServiceImpl service;
    @GetMapping
    public ApiResponse<NotificationServiceImpl.NotificationPage> page(@AuthenticationPrincipal CustomUserDetail user,
        @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size,
        @RequestParam(defaultValue="false") boolean unread) {
        return ApiResponse.success(service.getPage(user.getId(),page,size,unread));
    }
}
