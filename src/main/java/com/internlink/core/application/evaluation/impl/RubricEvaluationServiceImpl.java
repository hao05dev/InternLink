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
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
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

    @Override
    @Transactional(readOnly = true)
    public List<RubricEvaluationResponse> getEvaluationsByPlacement(UUID placementId) {
        return rubricRepository.findByPlacementId(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RubricEvaluationResponse getEvaluationById(UUID id) {
        RubricEvaluation evaluation = rubricRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("RubricEvaluation", "id", id));
        return mapToResponse(evaluation);
    }

    @Override
    @Transactional
    public RubricEvaluationResponse submitEvaluation(UUID evaluatorId, RubricEvaluationRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        User evaluator = userRepository.findById(evaluatorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", evaluatorId));

        // Kiểm tra xem đã có đánh giá cho đợt, người chấm và giai đoạn này chưa
        RubricEvaluation evaluation = rubricRepository
            .findByPlacementIdAndEvaluatorIdAndEvaluationStage(request.getPlacementId(), evaluatorId, request.getEvaluationStage())
            .orElse(RubricEvaluation.builder()
                .placement(placement)
                .evaluator(evaluator)
                .evaluatorRole(evaluator.getRole())
                .evaluationStage(request.getEvaluationStage())
                .build());

        evaluation.setRubricVersion(request.getRubricVersion().trim());
        evaluation.setCriteriaScores(request.getCriteriaScores());
        evaluation.setFinalScore(request.getFinalScore());
        evaluation.setQualitativeFeedback(request.getQualitativeFeedback());
        evaluation.setStatus(request.getStatus() != null ? request.getStatus() : "SUBMITTED");
        evaluation.setSubmittedAt(OffsetDateTime.now());

        return mapToResponse(rubricRepository.save(evaluation));
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