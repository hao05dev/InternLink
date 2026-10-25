package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.notification.EmailTemplateService;
import com.internlink.core.presentation.system.dto.request.EmailTemplateRequest;
import com.internlink.core.presentation.system.dto.response.EmailTemplateResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/email-templates")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','FACULTY_ADMIN','COMPANY_REP')")
public class EmailTemplateController {
    private final EmailTemplateService service;

    @GetMapping
    public ApiResponse<List<EmailTemplateResponse.Item>> list(@RequestParam(required = false) String purpose) {
        return ApiResponse.success(service.list(purpose));
    }

    @PostMapping
    public ApiResponse<EmailTemplateResponse.Item> create(@Valid @RequestBody EmailTemplateRequest.Save request) {
        return ApiResponse.success(service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EmailTemplateResponse.Item> update(
            @PathVariable UUID id, @Valid @RequestBody EmailTemplateRequest.Save request) {
        return ApiResponse.success(service.update(id, request));
    }

    @PostMapping("/{id}/archive")
    public ApiResponse<Void> archive(@PathVariable UUID id) {
        service.archive(id);
        return ApiResponse.success("Đã lưu trữ template", null);
    }

    @PostMapping("/preview")
    public ApiResponse<EmailTemplateResponse.Preview> preview(
            @Valid @RequestBody EmailTemplateRequest.Preview request) {
        return ApiResponse.success(service.preview(request));
    }
}
