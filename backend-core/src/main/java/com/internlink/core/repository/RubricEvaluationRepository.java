package com.internlink.core.repository;

import com.internlink.core.common.enums.RubricStage;
import com.internlink.core.entity.RubricEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RubricEvaluationRepository extends JpaRepository<RubricEvaluation, UUID> {
    List<RubricEvaluation> findByPlacementId(UUID placementId);
    Optional<RubricEvaluation> findByPlacementIdAndEvaluatorIdAndEvaluationStage(UUID placementId, UUID evaluatorId, RubricStage stage);
}
