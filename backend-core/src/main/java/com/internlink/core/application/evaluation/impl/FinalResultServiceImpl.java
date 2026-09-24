package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.FinalResultService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.enums.ResultStatus;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinalResultServiceImpl implements FinalResultService {

    private final JpaFinalResultRepository finalResultRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;
    private final JpaStudentProfileRepository studentProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public FinalResultResponse getFinalResultByPlacement(UUID placementId) {
        FinalResult result = finalResultRepository.findByPlacementId(placementId)
            .orElseThrow(() -> new ResourceNotFoundException("FinalResult", "placementId", placementId));
        return mapToResponse(result);
    }

    @Override
    @Transactional
    public FinalResultResponse calculateAndFinalizeResult(UUID decidedByUserId, FinalResultRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        User admin = userRepository.findById(decidedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", decidedByUserId));

        // Tự động tính điểm tổng kết: 40% Doanh nghiệp + 40% GVHD + 20% Tuân thủ
        BigDecimal mentor = request.getMentorScore() != null ? request.getMentorScore() : BigDecimal.ZERO;
        BigDecimal lecturer = request.getLecturerScore() != null ? request.getLecturerScore() : BigDecimal.ZERO;
        BigDecimal compliance = request.getComplianceScore() != null ? request.getComplianceScore() : BigDecimal.ZERO;

        BigDecimal total = mentor.multiply(BigDecimal.valueOf(0.40))
            .add(lecturer.multiply(BigDecimal.valueOf(0.40)))
            .add(compliance.multiply(BigDecimal.valueOf(0.20)))
            .setScale(2, RoundingMode.HALF_UP);

        FinalResult result = finalResultRepository.findByPlacementId(request.getPlacementId())
            .orElse(FinalResult.builder()
                .placement(placement)
                .build());

        result.setMentorScore(mentor);
        result.setLecturerScore(lecturer);
        result.setComplianceScore(compliance);
        result.setComponentBreakdown(request.getComponentBreakdown());
        result.setFinalScore(total);
        result.setResultStatus(request.getResultStatus());
        result.setDecidedBy(admin);
        result.setFinalizedAt(OffsetDateTime.now());
        result.setPublishedAt(OffsetDateTime.now());

        FinalResult saved = finalResultRepository.save(result);

        // Cập nhật trạng thái đợt thực tập thành COMPLETED nếu Đạt
        if (request.getResultStatus() == ResultStatus.PASSED) {
            placement.setStatus(PlacementStatus.COMPLETED);
            placementRepository.save(placement);
        }

        return mapToResponse(saved);
    }

    private FinalResultResponse mapToResponse(FinalResult entity) {
        String studentCode = studentProfileRepository.findById(entity.getPlacement().getStudent().getId())
            .map(StudentProfile::getStudentCode)
            .orElse(null);

        return FinalResultResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .studentName(entity.getPlacement().getStudent().getFullName())
            .studentCode(studentCode)
            .companyName(entity.getPlacement().getCompany().getCompanyName())
            .mentorScore(entity.getMentorScore())
            .lecturerScore(entity.getLecturerScore())
            .complianceScore(entity.getComplianceScore())
            .componentBreakdown(entity.getComponentBreakdown())
            .finalScore(entity.getFinalScore())
            .resultStatus(entity.getResultStatus())
            .decidedByUserId(entity.getDecidedBy() != null ? entity.getDecidedBy().getId() : null)
            .decidedByName(entity.getDecidedBy() != null ? entity.getDecidedBy().getFullName() : null)
            .publishedAt(entity.getPublishedAt())
            .finalizedAt(entity.getFinalizedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}