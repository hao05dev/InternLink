package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.notification.EmailDeliveryAdminService;
import com.internlink.core.presentation.system.dto.response.EmailDeliveryResponse;
import com.internlink.core.shared.api.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications/delivery-summary")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
public class EmailDeliveryStatusController {
    private final EmailDeliveryAdminService service;

    @GetMapping
    public ApiResponse<EmailDeliveryResponse.Summary> summary() {
        return ApiResponse.success(service.summary());
    }
}
