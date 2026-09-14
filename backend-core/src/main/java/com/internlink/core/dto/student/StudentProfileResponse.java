package com.internlink.core.dto.student;

import com.internlink.core.entity.StudentProfile;
import java.util.List;

public record StudentProfileResponse(
        Long id,
        Long userId,
        String studentCode,
        String major,
        String academicYear,
        Double gpa,
        Integer passedCredits,
        String cvFileUrl,
        String portfolioUrl,
        String githubUrl,
        String linkedinUrl,
        String bioSummary,
        Long preferredProvinceId,
        String desiredPosition,
        String preferredWorkFormat,
        String internshipStatus,
        List<StudentSkillDto> skills,
        List<StudentCourseDto> courses) {
    public static StudentProfileResponse of(
            StudentProfile profile,
            List<StudentSkillDto> skills,
            List<StudentCourseDto> courses) {
        return new StudentProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getStudentCode(),
                profile.getMajor(),
                profile.getAcademicYear(),
                profile.getGpa(),
                profile.getPassedCredits(),
                profile.getCvFileUrl(),
                profile.getPortfolioUrl(),
                profile.getGithubUrl(),
                profile.getLinkedinUrl(),
                profile.getBioSummary(),
                profile.getPreferredProvinceId(),
                profile.getDesiredPosition(),
                profile.getPreferredWorkFormat(),
                profile.getInternshipStatus(),
                skills,
                courses);
    }
}