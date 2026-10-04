package com.internlink.core.application.placement.impl;

import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.presentation.placement.dto.response.InternshipPlacementResponse;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InternshipPlacementMapper {

    private final JpaStudentProfileRepository studentProfileRepository;

    public InternshipPlacementResponse toResponse(InternshipPlacement entity) {
        String studentCode = studentProfileRepository.findById(entity.getStudent().getId())
            .map(StudentProfile::getStudentCode)
            .orElse(null);

        UUID jobId = null;
        String jobTitle = null;
        String workFormat = null;

        if (entity.getAgreement() != null && entity.getAgreement().getOffer() != null) {
            var offer = entity.getAgreement().getOffer();
            if (offer.getApplication() != null && offer.getApplication().getJob() != null) {
                var job = offer.getApplication().getJob();
                jobId = job.getId();
                jobTitle = job.getTitle();
                workFormat = job.getWorkFormat() != null ? job.getWorkFormat().name() : null;
            }
        } else if (entity.getStudentFoundApplication() != null) {
            jobTitle = entity.getStudentFoundApplication().getWorkDescription();
        }

        String mentorEmail = entity.getMentor() != null ? entity.getMentor().getEmail() : null;
        String mentorPhone = entity.getMentor() != null ? entity.getMentor().getPhoneNumber() : null;
        String studentEmail = entity.getStudent() != null ? entity.getStudent().getEmail() : null;
        String studentPhone = entity.getStudent() != null ? entity.getStudent().getPhoneNumber() : null;
        String academicYear = entity.getTerm() != null ? entity.getTerm().getAcademicYear() : null;

        return InternshipPlacementResponse.builder()
            .id(entity.getId())
            .agreementId(entity.getAgreement() != null ? entity.getAgreement().getId() : null)
            .source(entity.getSource())
            .studentFoundApplicationId(entity.getStudentFoundApplication() != null ? entity.getStudentFoundApplication().getId() : null)
            .assessmentSchemeId(entity.getAssessmentScheme() != null ? entity.getAssessmentScheme().getId() : null)
            .studentId(entity.getStudent().getId())
            .studentName(entity.getStudent().getFullName())
            .studentCode(studentCode)
            .studentEmail(studentEmail)
            .studentPhone(studentPhone)
            .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
            .companyName(entity.getCompany() != null ? entity.getCompany().getCompanyName()
                : (entity.getStudentFoundApplication() != null ? entity.getStudentFoundApplication().getHostName() : null))
            .externalHostAddress(entity.getStudentFoundApplication() != null ? entity.getStudentFoundApplication().getHostAddress() : null)
            .mentorId(entity.getMentor() != null ? entity.getMentor().getId() : null)
            .mentorName(entity.getMentor() != null ? entity.getMentor().getFullName() : null)
            .mentorEmail(mentorEmail)
            .mentorPhone(mentorPhone)
            .lecturerId(entity.getLecturer() != null ? entity.getLecturer().getId() : null)
            .lecturerName(entity.getLecturer() != null ? entity.getLecturer().getFullName() : null)
            .termId(entity.getTerm() != null ? entity.getTerm().getId() : null)
            .termName(entity.getTerm() != null ? entity.getTerm().getTermName() : null)
            .termStatus(entity.getTerm() != null && entity.getTerm().getStatus() != null ? entity.getTerm().getStatus().name() : null)
            .academicYear(academicYear)
            .jobId(jobId)
            .jobTitle(jobTitle)
            .workFormat(workFormat)
            .workSchedule(entity.getWorkSchedule())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .totalHoursWorked(entity.getTotalHoursWorked())
            .status(entity.getStatus())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
