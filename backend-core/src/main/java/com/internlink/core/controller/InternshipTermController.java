package com.internlink.core.controller;

import com.internlink.core.dto.term.*;
import com.internlink.core.entity.AssignmentHistory;
import com.internlink.core.entity.InternshipTerm;
import com.internlink.core.entity.TermStudentRegistration;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.InternshipTermService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/terms")
@RequiredArgsConstructor
public class InternshipTermController {

    private final InternshipTermService termService;

    // 1. Lấy danh sách tất cả kỳ thực tập
    @GetMapping
    public ResponseEntity<List<InternshipTerm>> getAllTerms() {
        return ResponseEntity.ok(termService.getAllTerms());
    }

    // 2. Chi tiết kỳ thực tập
    @GetMapping("/{id}")
    public ResponseEntity<InternshipTerm> getTermById(@PathVariable Long id) {
        return ResponseEntity.ok(termService.getTermById(id));
    }

    // 3. Tạo mới kỳ thực tập (Chỉ Quản lý Khoa / Admin)
    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<InternshipTerm> createTerm(@Valid @RequestBody InternshipTermRequest request) {
        return ResponseEntity.ok(termService.createTerm(request));
    }

    // 4. Đăng ký / Import sinh viên vào kỳ thực tập
    @PostMapping("/{termId}/students/{studentProfileId}")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<TermStudentRegistration> registerStudent(
            @PathVariable Long termId,
            @PathVariable Long studentProfileId,
            @RequestParam(required = false, defaultValue = "DEFAULT_CLASS") String classCode) {
        return ResponseEntity.ok(termService.registerStudentToTerm(termId, studentProfileId, classCode));
    }

    // 5. Xem danh sách sinh viên trong kỳ
    @GetMapping("/{termId}/students")
    public ResponseEntity<List<TermStudentRegistration>> getStudentsInTerm(@PathVariable Long termId) {
        return ResponseEntity.ok(termService.getStudentsInTerm(termId));
    }

    // 6. Phân công Giảng viên hướng dẫn (GVHD)
    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<SupervisorAssignmentResponse> assignSupervisor(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SupervisorAssignmentRequest request) {
        return ResponseEntity.ok(termService.assignSupervisor(request, userDetails.getId()));
    }

    // 7. Điều chuyển GVHD
    @PutMapping("/assignments/{assignmentId}/reassign")
    @PreAuthorize("hasAnyRole('FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<SupervisorAssignmentResponse> reassignSupervisor(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long assignmentId,
            @Valid @RequestBody ReassignSupervisorRequest request) {
        return ResponseEntity.ok(termService.reassignSupervisor(assignmentId, request, userDetails.getId()));
    }

    // 8. Lấy danh sách phân công GVHD theo kỳ thực tập
    @GetMapping("/{termId}/assignments")
    public ResponseEntity<List<SupervisorAssignmentResponse>> getAssignmentsByTerm(@PathVariable Long termId) {
        return ResponseEntity.ok(termService.getAssignmentsByTerm(termId));
    }

    // 9. Xem lịch sử thay đổi GVHD
    @GetMapping("/assignments/{assignmentId}/histories")
    public ResponseEntity<List<AssignmentHistory>> getAssignmentHistories(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(termService.getAssignmentHistories(assignmentId));
    }
}