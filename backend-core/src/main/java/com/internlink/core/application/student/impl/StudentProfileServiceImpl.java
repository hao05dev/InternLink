package com.internlink.core.application.student.impl;

import com.internlink.core.application.student.StudentProfileService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.JpaAcademicProgramRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.student.dto.request.StudentProfileRequest;
import com.internlink.core.presentation.student.dto.response.StudentProfileResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentProfileServiceImpl implements StudentProfileService {

    private final JpaStudentProfileRepository studentProfileRepository;
    private final JpaUserRepository userRepository;
    private final JpaAcademicProgramRepository academicProgramRepository;

    @Override
    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileByUserId(UUID userId) {
        StudentProfile profile = studentProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        return mapToResponse(profile);
    }

    @Override
    @Transactional
    public StudentProfileResponse createOrUpdateProfile(UUID userId, StudentProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Chỉ tài khoản sinh viên (STUDENT) mới có thể tạo hoặc sửa hồ sơ sinh viên");
        }

        AcademicProgram program = academicProgramRepository.findById(request.getProgramId())
            .orElseThrow(() -> new ResourceNotFoundException("AcademicProgram", "id", request.getProgramId()));

        String studentCode = request.getStudentCode().trim().toUpperCase();
        studentProfileRepository.findByStudentCode(studentCode)
            .filter(existing -> !existing.getUserId().equals(userId))
            .ifPresent(existing -> {
                throw new BadRequestException("Mã số sinh viên '" + studentCode + "' đã được sử dụng");
            });

        StudentProfile profile = studentProfileRepository.findById(userId)
            .orElse(StudentProfile.builder()
                .userId(userId)
                .user(user)
                .build());

        profile.setProgram(program);
        profile.setStudentCode(studentCode);
        profile.setGpa(request.getGpa());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setBio(request.getBio());
        profile.setCertificates(request.getCertificates() != null ? request.getCertificates() : java.util.List.of());
        profile.setPassedCourses(request.getPassedCourses() != null ? request.getPassedCourses() : java.util.List.of());
        profile.setPreferences(request.getPreferences() != null ? request.getPreferences() : java.util.Map.of());

        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    private StudentProfileResponse mapToResponse(StudentProfile entity) {
        return StudentProfileResponse.builder()
            .userId(entity.getUserId())
            .studentCode(entity.getStudentCode())
            .fullName(entity.getUser().getFullName())
            .email(entity.getUser().getEmail())
            .phoneNumber(entity.getUser().getPhoneNumber())
            .programId(entity.getProgram().getId())
            .programName(entity.getProgram().getName())
            .departmentName(entity.getProgram().getDepartment().getName())
            .gpa(entity.getGpa())
            .githubUrl(entity.getGithubUrl())
            .bio(entity.getBio())
            .certificates(entity.getCertificates())
            .passedCourses(entity.getPassedCourses())
            .preferences(entity.getPreferences())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
