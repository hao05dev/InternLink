package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.upload.R2MaintenanceService;
import com.internlink.core.shared.api.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents/storage")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class R2MaintenanceController {
    private final R2MaintenanceService service;

    public record Purge(List<String> keys, String reason) {}

    @GetMapping("/orphans")
    public ApiResponse<R2MaintenanceService.Page> preview(
            @RequestParam(required = false) String cursor) {
        return ApiResponse.success(service.preview(cursor));
    }

    @PostMapping("/orphans/purge")
    public ApiResponse<Void> purge(@RequestBody Purge request) {
        service.purge(request.keys(), request.reason());
        return ApiResponse.success("Đã xóa object không được tham chiếu", null);
    }
}
