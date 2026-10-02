package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.CtuGradingHelper;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FinalResultMapper {

    private final JpaStudentProfileRepository studentProfileRepository;

    public FinalResultResponse toResponse(FinalResult entity) {
        String studentCode = studentProfileRepository.findById(entity.getPlacement().getStudent().getId())
            .map(StudentProfile::getStudentCode)
            .orElse(null);

        // Quy đổi thang điểm CTU
        CtuGradingHelper.CtuGrade ctuGrade = CtuGradingHelper.convertFromScale10(entity.getFinalScore());

        return FinalResultResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .studentName(entity.getPlacement().getStudent().getFullName())
            .studentCode(studentCode)
            .companyName(entity.getPlacement().getCompany() != null
                ? entity.getPlacement().getCompany().getCompanyName()
                : entity.getPlacement().getStudentFoundApplication().getHostName())
            .mentorScore(entity.getMentorScore())
            .lecturerScore(entity.getLecturerScore())
            .complianceScore(entity.getComplianceScore())
            .componentBreakdown(entity.getComponentBreakdown())
            .finalScore(entity.getFinalScore())
            .scoreScale4(ctuGrade.getScoreScale4())
            .letterGrade(ctuGrade.getLetterGrade())
            .classification(ctuGrade.getClassification())
            .resultStatus(entity.getResultStatus())
            .decidedByUserId(entity.getDecidedBy() != null ? entity.getDecidedBy().getId() : null)
            .decidedByName(entity.getDecidedBy() != null ? entity.getDecidedBy().getFullName() : null)
            .isPublished(entity.getPublishedAt() != null)
            .publishedAt(entity.getPublishedAt())
            .finalizedAt(entity.getFinalizedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
