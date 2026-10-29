package com.internlink.core.presentation.organization.controller;

import com.internlink.core.application.organization.FacultyLecturerManagementService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.organization.dto.request.CreateLecturerRequest;
import com.internlink.core.presentation.organization.dto.request.LecturerImportItem;
import com.internlink.core.presentation.organization.dto.response.BatchLecturerImportResponse;
import com.internlink.core.presentation.organization.dto.response.FacultyLecturerResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.validation.ImportRowLimit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/faculty/lecturers")
@RequiredArgsConstructor
public class FacultyLecturerController {

    private final FacultyLecturerManagementService facultyLecturerService;
    private final JpaUserRepository users;
    private final SecurityGuard securityGuard;

    @GetMapping
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<List<FacultyLecturerResponse>>> list(
            @RequestParam(required = false) UUID termId) {
        User actor = users.findById(securityGuard.currentUser().getId()).orElseThrow();
        if (actor.getDepartment() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        List<FacultyLecturerResponse> result = facultyLecturerService.getLecturers(actor.getDepartment().getId(), termId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<FacultyLecturerResponse>> createLecturer(
            @RequestParam(required = false) UUID termId,
            @Valid @RequestBody CreateLecturerRequest request) {
        User actor = users.findById(securityGuard.currentUser().getId()).orElseThrow();
        FacultyLecturerResponse result = facultyLecturerService.createLecturer(
                actor.getDepartment().getId(), termId, request, actor.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã thêm giảng viên hướng dẫn thành công", result));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<BatchLecturerImportResponse>> importLecturers(
            @RequestParam(required = false) UUID termId,
            @Valid @RequestBody List<LecturerImportItem> items) {
        ImportRowLimit.check(items);
        User actor = users.findById(securityGuard.currentUser().getId()).orElseThrow();
        BatchLecturerImportResponse result = facultyLecturerService.importLecturers(
                actor.getDepartment().getId(), termId, items, actor.getId());
        return ResponseEntity.ok(ApiResponse.success("Nhập danh sách giảng viên thành công", result));
    }
}
