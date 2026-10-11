package com.internlink.core.presentation.placement.controller;

import com.internlink.core.application.placement.IntroductionLetterService;
import com.internlink.core.presentation.placement.dto.request.CreateIntroductionLetterRequest;
import com.internlink.core.presentation.placement.dto.request.ReviewIntroductionLetterRequest;
import com.internlink.core.presentation.placement.dto.response.IntroductionLetterResponse;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/introduction-letters")
@RequiredArgsConstructor
public class IntroductionLetterController {

    private final IntroductionLetterService service;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<IntroductionLetterResponse> create(@Valid @RequestBody CreateIntroductionLetterRequest request) {
        return ApiResponse.success(service.create(request));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<IntroductionLetterResponse>> mine() {
        return ApiResponse.success(service.mine());
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<IntroductionLetterResponse> cancel(@PathVariable UUID id) {
        return ApiResponse.success(service.cancel(id));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ApiResponse<IntroductionLetterResponse> review(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewIntroductionLetterRequest request
    ) {
        return ApiResponse.success(service.review(id, request));
    }

    @PatchMapping("/{id}/confirm-received")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ApiResponse<IntroductionLetterResponse> confirmReceived(@PathVariable UUID id) {
        return ApiResponse.success(service.confirmReceived(id));
    }

    @GetMapping("/term/{termId}")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN', 'LECTURER')")
    public ApiResponse<List<IntroductionLetterResponse>> byTerm(@PathVariable UUID termId) {
        return ApiResponse.success(service.byTerm(termId));
    }
}
