package com.internlink.core.controller;

import com.internlink.core.dto.student.StudentCourseDto;
import com.internlink.core.dto.student.StudentProfileRequest;
import com.internlink.core.dto.student.StudentProfileResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponse> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(studentProfileService.getMyProfile(userDetails.getId()));
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileResponse> saveProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(studentProfileService.saveOrUpdateProfile(userDetails.getId(), request));
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentCourseDto> addCourse(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StudentCourseDto dto) {
        return ResponseEntity.ok(studentProfileService.addCourse(userDetails.getId(), dto));
    }
}