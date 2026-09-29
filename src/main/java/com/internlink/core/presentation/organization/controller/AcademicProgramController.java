package com.internlink.core.presentation.organization.controller;

import com.internlink.core.application.organization.AcademicProgramService;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.presentation.organization.dto.request.AcademicProgramRequest;
import com.internlink.core.presentation.organization.dto.response.AcademicProgramResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/academic-programs")
@RequiredArgsConstructor
public class AcademicProgramController {

    private final AcademicProgramService programService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicProgramResponse>>> getAllPrograms() {
        List<AcademicProgramResponse> programs = programService.getAllPrograms();
        return ResponseEntity.ok(ApiResponse.success(programs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicProgramResponse>> getProgramById(@PathVariable UUID id) {
        AcademicProgramResponse program = programService.getProgramById(id);
        return ResponseEntity.ok(ApiResponse.success(program));
    }

    @GetMapping("/by-department/{departmentId}")
    public ResponseEntity<ApiResponse<List<AcademicProgramResponse>>> getProgramsByDepartment(
            @PathVariable UUID departmentId
    ) {
        List<AcademicProgramResponse> programs = programService.getProgramsByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success(programs));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicProgramResponse>> createProgram(
            @Valid @RequestBody AcademicProgramRequest request
    ) {
        AcademicProgramResponse response = programService.createProgram(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo ngành đào tạo thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicProgramResponse>> updateProgram(
            @PathVariable UUID id,
            @Valid @RequestBody AcademicProgramRequest request
    ) {
        AcademicProgramResponse response = programService.updateProgram(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ngành đào tạo thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable UUID id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa ngành đào tạo thành công", null));
    }
}
