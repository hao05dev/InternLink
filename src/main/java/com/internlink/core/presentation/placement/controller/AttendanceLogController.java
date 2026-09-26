package com.internlink.core.presentation.placement.controller;

import com.internlink.core.application.placement.AttendanceLogService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.placement.dto.request.AttendanceLogRequest;
import com.internlink.core.presentation.placement.dto.response.AttendanceLogResponse;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.AttendanceStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceLogController {

    private final AttendanceLogService attendanceService;

    @GetMapping("/placement/{placementId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceLogResponse>>> getAttendanceByPlacement(
        @PathVariable UUID placementId
    ) {
        List<AttendanceLogResponse> logs = attendanceService.getAttendanceByPlacement(placementId);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceLogResponse>> checkIn(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @Valid @RequestBody AttendanceLogRequest request
    ) {
        AttendanceLogResponse response = attendanceService.checkIn(userDetail.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Check-in chấm công thành công", response));
    }

    @PatchMapping("/{id}/check-out")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceLogResponse>> checkOut(
        @PathVariable UUID id,
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @RequestBody(required = false) Map<String, Object> checkOutLocation
    ) {
        AttendanceLogResponse response = attendanceService.checkOut(id, userDetail.getId(), checkOutLocation);
        return ResponseEntity.ok(ApiResponse.success("Check-out chấm công thành công", response));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('COMPANY_MENTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceLogResponse>> confirmAttendance(
        @PathVariable UUID id,
        @RequestParam AttendanceStatus status,
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        AttendanceLogResponse response = attendanceService.confirmAttendance(id, userDetail.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận phiên chấm công thành công", response));
    }
}
