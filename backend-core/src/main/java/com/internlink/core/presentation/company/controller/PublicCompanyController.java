package com.internlink.core.presentation.company.controller;

import com.internlink.core.application.company.PublicCompanyService;
import com.internlink.core.presentation.company.dto.response.CompanyPublicResponse;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/companies/public")
@RequiredArgsConstructor
public class PublicCompanyController {
    private final PublicCompanyService companies;

    @GetMapping
    public ApiResponse<List<CompanyPublicResponse>> list() {
        return ApiResponse.success(companies.list());
    }

    @GetMapping("/{id}")
    public ApiResponse<CompanyPublicResponse> get(@PathVariable UUID id) {
        return ApiResponse.success(companies.get(id));
    }
}
