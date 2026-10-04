package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.notification.NotificationCampaignService;
import com.internlink.core.presentation.system.dto.request.NotificationCampaignRequest;
import com.internlink.core.presentation.system.dto.response.NotificationCampaignResponse.*;
import com.internlink.core.shared.api.ApiResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications/campaigns")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','FACULTY_ADMIN')")
public class NotificationCampaignController {
    private final NotificationCampaignService service;

    @PostMapping("/preview")
    public ApiResponse<Preview> preview(@Valid @RequestBody NotificationCampaignRequest request) {
        return ApiResponse.success(service.preview(request));
    }

    @PostMapping
    public ApiResponse<Detail> create(@Valid @RequestBody NotificationCampaignRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @GetMapping
    public ApiResponse<Page> page(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.page(page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<Detail> detail(
            @PathVariable UUID id, @RequestParam(defaultValue = "0") int page) {
        return ApiResponse.success(service.detail(id, page));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancel(@PathVariable UUID id) {
        service.cancel(id);
        return ApiResponse.success("Đã dừng campaign", null);
    }

    @PostMapping("/{id}/retry")
    public ApiResponse<Void> retry(@PathVariable UUID id) {
        service.retry(id);
        return ApiResponse.success("Đã xếp hàng các người nhận lỗi", null);
    }
}
