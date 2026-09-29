package com.internlink.core.presentation.organization.controller;

import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/faculty/lecturers")
@RequiredArgsConstructor
public class FacultyLecturerController {
    private final JpaUserRepository users;
    private final SecurityGuard securityGuard;

    public record LecturerOption(UUID id, String fullName, String departmentName) {}

    @GetMapping
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<LecturerOption>>> list() {
        var actor = users.findById(securityGuard.currentUser().getId()).orElseThrow();
        if (actor.getDepartment() == null) return ResponseEntity.ok(ApiResponse.success(List.of()));
        var list = users.findByDepartmentIdAndRole(actor.getDepartment().getId(), UserRole.LECTURER).stream()
            .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
            .map(user -> new LecturerOption(user.getId(), user.getFullName(), user.getDepartment().getName()))
            .toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
