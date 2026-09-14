package com.internlink.core.service;

import com.internlink.core.dto.student.*;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final StudentSkillRepository skillRepository;
    private final StudentCourseRepository courseRepository;
    private final SkillRepository masterSkillRepository;

    // 1. Sinh viên xem hồ sơ của chính mình
    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile(Long userId) {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user ID: " + userId));

        return buildFullProfileResponse(profile);
    }

    // 2. Sinh viên tạo hoặc cập nhật hồ sơ cá nhân
    @Transactional
    public StudentProfileResponse saveOrUpdateProfile(Long userId, StudentProfileRequest request) {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElse(StudentProfile.builder().userId(userId).build());

        profile.setStudentCode(request.studentCode());
        profile.setMajor(request.major());
        profile.setAcademicYear(request.academicYear());
        profile.setGpa(request.gpa());
        profile.setPassedCredits(request.passedCredits());
        profile.setCvFileUrl(request.cvFileUrl());
        profile.setPortfolioUrl(request.portfolioUrl());
        profile.setGithubUrl(request.githubUrl());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setBioSummary(request.bioSummary());
        profile.setPreferredProvinceId(request.preferredProvinceId());
        profile.setDesiredPosition(request.desiredPosition());
        profile.setPreferredWorkFormat(request.preferredWorkFormat());

        StudentProfile savedProfile = profileRepository.save(profile);

        // Lưu danh sách kỹ năng nếu có
        if (request.skills() != null) {
            skillRepository.deleteByIdStudentProfileId(savedProfile.getId());
            List<StudentSkill> studentSkills = request.skills().stream().map(dto -> {
                Skill masterSkill = masterSkillRepository.findById(dto.skillId()).orElse(null);
                return StudentSkill.builder()
                        .id(new StudentSkillId(savedProfile.getId(), dto.skillId()))
                        .studentProfile(savedProfile)
                        .skill(masterSkill)
                        .proficiencyLevel(dto.proficiencyLevel())
                        .yearsExperience(dto.yearsExperience())
                        .build();
            }).toList();
            skillRepository.saveAll(studentSkills);
        }

        return buildFullProfileResponse(savedProfile);
    }

    // 3. Thêm học phần đã học (Course)
    @Transactional
    public StudentCourseDto addCourse(Long userId, StudentCourseDto dto) {
        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found for user ID: " + userId));

        StudentCourse course = StudentCourse.builder()
                .studentProfileId(profile.getId())
                .courseCode(dto.courseCode())
                .courseName(dto.courseName())
                .grade(dto.grade())
                .credits(dto.credits())
                .semester(dto.semester())
                .build();

        StudentCourse saved = courseRepository.save(course);
        return new StudentCourseDto(saved.getCourseCode(), saved.getCourseName(), saved.getGrade(), saved.getCredits(),
                saved.getSemester());
    }

    private StudentProfileResponse buildFullProfileResponse(StudentProfile profile) {
        List<StudentSkillDto> skills = skillRepository.findByIdStudentProfileId(profile.getId()).stream()
                .map(ss -> new StudentSkillDto(
                        ss.getId().getSkillId(),
                        ss.getSkill() != null ? ss.getSkill().getName() : ss.getId().getSkillId(),
                        ss.getProficiencyLevel(),
                        ss.getYearsExperience()))
                .toList();

        List<StudentCourseDto> courses = courseRepository.findByStudentProfileId(profile.getId()).stream()
                .map(sc -> new StudentCourseDto(
                        sc.getCourseCode(),
                        sc.getCourseName(),
                        sc.getGrade(),
                        sc.getCredits(),
                        sc.getSemester()))
                .toList();

        return StudentProfileResponse.of(profile, skills, courses);
    }
}