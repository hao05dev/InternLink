package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.RubricEvaluationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.evaluation.RubricEvaluation;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaRubricEvaluationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.evaluation.dto.request.RubricEvaluationRequest;
import com.internlink.core.presentation.evaluation.dto.response.RubricEvaluationResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.TermGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RubricEvaluationServiceImpl implements RubricEvaluationService {

    private final JpaRubricEvaluationRepository rubricRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;

    @Override
    @Transactional(readOnly = true)
    public List<RubricEvaluationResponse> getEvaluationsByPlacement(UUID placementId) {
        InternshipPlacement placement = placementRepository.findById(placementId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", placementId));
        ResourceAuthorization.require(ResourceAuthorization.canReadPlacement(currentActor(), placement));
        return rubricRepository.findByPlacementId(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RubricEvaluationResponse getEvaluationById(UUID id) {
        RubricEvaluation evaluation = rubricRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("RubricEvaluation", "id", id));
        ResourceAuthorization.require(ResourceAuthorization.canReadPlacement(currentActor(), evaluation.getPlacement()));
        return mapToResponse(evaluation);
    }

    @Override
    @Transactional
    public RubricEvaluationResponse submitEvaluation(UUID evaluatorId, RubricEvaluationRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));
        TermGuard.requireNotClosed(placement.getTerm());

        User evaluator = userRepository.findById(evaluatorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", evaluatorId));
        ResourceAuthorization.require(evaluatorId.equals(securityGuard.currentUser().getId()));

        if (evaluator.getRole() != UserRole.COMPANY_MENTOR && evaluator.getRole() != UserRole.LECTURER) {
            throw new BadRequestException("Chỉ Mentor doanh nghiệp hoặc Giảng viên được gửi đánh giá Rubric");
        }
        if (evaluator.getRole() == UserRole.COMPANY_MENTOR
            && (placement.getMentor() == null || !placement.getMentor().getId().equals(evaluatorId))) {
            throw new BadRequestException("Mentor không phụ trách lần thực tập này");
        }
        if (evaluator.getRole() == UserRole.LECTURER
            && !placement.getLecturer().getId().equals(evaluatorId)) {
            throw new BadRequestException("Giảng viên không phụ trách lần thực tập này");
        }
        String evaluationStatus = request.getStatus() != null ? request.getStatus().toUpperCase() : "SUBMITTED";
        if (!evaluationStatus.equals("DRAFT") && !evaluationStatus.equals("SUBMITTED")) {
            throw new BadRequestException("Trạng thái đánh giá chỉ có thể là DRAFT hoặc SUBMITTED");
        }

        // Kiểm tra xem đã có đánh giá cho đợt, người chấm và giai đoạn này chưa
        RubricEvaluation evaluation = rubricRepository
            .findByPlacementIdAndEvaluatorIdAndEvaluationStage(request.getPlacementId(), evaluatorId, request.getEvaluationStage())
            .orElse(RubricEvaluation.builder()
                .placement(placement)
                .evaluator(evaluator)
                .evaluatorRole(evaluator.getRole())
                .evaluationStage(request.getEvaluationStage())
                .build());
        if ("SUBMITTED".equals(evaluation.getStatus())) {
            throw new BadRequestException("Phiếu đánh giá đã nộp, không thể sửa trực tiếp");
        }

        evaluation.setRubricVersion(request.getRubricVersion().trim());
        evaluation.setCriteriaScores(request.getCriteriaScores());
        evaluation.setFinalScore(request.getFinalScore());
        evaluation.setQualitativeFeedback(request.getQualitativeFeedback());
        evaluation.setStatus(evaluationStatus);
        evaluation.setSubmittedAt(evaluationStatus.equals("SUBMITTED") ? OffsetDateTime.now() : null);

        return mapToResponse(rubricRepository.save(evaluation));
    }

    private User currentActor() {
        UUID actorId = securityGuard.currentUser().getId();
        return userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
    }

    private RubricEvaluationResponse mapToResponse(RubricEvaluation entity) {
        return RubricEvaluationResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .evaluatorId(entity.getEvaluator().getId())
            .evaluatorName(entity.getEvaluator().getFullName())
            .evaluatorRole(entity.getEvaluatorRole())
            .evaluationStage(entity.getEvaluationStage())
            .rubricVersion(entity.getRubricVersion())
            .criteriaScores(entity.getCriteriaScores())
            .finalScore(entity.getFinalScore())
            .qualitativeFeedback(entity.getQualitativeFeedback())
            .status(entity.getStatus())
            .submittedAt(entity.getSubmittedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
