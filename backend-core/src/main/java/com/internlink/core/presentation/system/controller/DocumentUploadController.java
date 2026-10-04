package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.upload.DocumentUploadService;
import com.internlink.core.presentation.system.dto.request.DocumentUploadRequest;
import com.internlink.core.presentation.system.dto.response.*;
import com.internlink.core.shared.api.ApiResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents/uploads")
@RequiredArgsConstructor
public class DocumentUploadController {
    private final DocumentUploadService service;

    @GetMapping("/capabilities")
    public ApiResponse<DocumentUploadResponse.Capabilities> capabilities() {
        return ApiResponse.success(service.capabilities());
    }

    @PostMapping
    public ApiResponse<DocumentUploadResponse.Ticket> initiate(
            @Valid @RequestBody DocumentUploadRequest request) {
        return ApiResponse.success(service.initiate(request));
    }

    @PostMapping("/{id}/finalize")
    public ApiResponse<DocumentResponse> complete(@PathVariable UUID id) {
        return ApiResponse.success(service.finalizeUpload(id));
    }
}
