package com.internlink.core.controller;

import com.internlink.core.dto.company.CompanyRequest;
import com.internlink.core.dto.company.CompanyResponse;
import com.internlink.core.dto.company.VerifyCompanyRequest;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    // --- 1. PUBLIC ENDPOINTS ---
    @GetMapping("/public/companies")
    public ResponseEntity<List<CompanyResponse>> getVerifiedCompanies() {
        return ResponseEntity.ok(companyService.getVerifiedCompanies());
    }

    // --- 2. COMPANY REP ENDPOINTS ---
    @GetMapping("/company/profile/me")
    @PreAuthorize("hasAnyRole('COMPANY_REP', 'COMPANY_MENTOR')")
    public ResponseEntity<CompanyResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(companyService.getMyCompanyProfile(userDetails.getId()));
    }

    @PostMapping("/company/profile")
    @PreAuthorize("hasRole('COMPANY_REP')")
    public ResponseEntity<CompanyResponse> saveProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.saveOrUpdateProfile(userDetails.getId(), request));
    }

    // --- 3. FACULTY ADMIN ENDPOINTS ---
    @GetMapping("/faculty/companies/pending")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<List<CompanyResponse>> getPendingCompanies() {
        return ResponseEntity.ok(companyService.getPendingCompanies());
    }

    @PostMapping("/faculty/companies/{id}/verify")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<CompanyResponse> verifyCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody VerifyCompanyRequest request) {
        return ResponseEntity.ok(companyService.verifyCompany(id, userDetails.getId(), request));
    }
}