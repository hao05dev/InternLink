package com.internlink.core.presentation.system.controller;
import com.internlink.core.application.system.notification.NotificationPreferenceService;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/notifications/preferences") @RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationSettingsController {
    private final NotificationPreferenceService service;
    @GetMapping public ApiResponse<NotificationPreferenceService.Preferences> get() { return ApiResponse.success(service.get()); }
    @PutMapping public ApiResponse<NotificationPreferenceService.Preferences> update(
        @Valid @RequestBody NotificationPreferenceService.Preferences request) { return ApiResponse.success(service.update(request)); }
}
