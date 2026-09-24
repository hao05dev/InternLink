package com.internlink.core.presentation.organization.controller;

import com.internlink.core.application.organization.StudentRosterService;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.presentation.organization.dto.request.StudentRosterImportItem;
import com.internlink.core.presentation.organization.dto.response.StudentRosterResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rosters")
@RequiredArgsConstructor
public class StudentRosterController {

    private final StudentRosterService rosterService;

    @GetMapping("/by-term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<StudentRosterResponse>>> getRostersByTerm(
            @PathVariable UUID termId
    ) {
        List<StudentRosterResponse> rosters = rosterService.getRostersByTerm(termId);
        return ResponseEntity.ok(ApiResponse.success(rosters));
    }

    @PostMapping("/import/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentRosterResponse>>> importRosterList(
            @PathVariable UUID termId,
            @Valid @RequestBody List<StudentRosterImportItem> items
    ) {
        List<StudentRosterResponse> responses = rosterService.importRosterList(termId, items);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Import danh sách sinh viên thành công (" + responses.size() + " sinh viên)", responses));
    }
}
