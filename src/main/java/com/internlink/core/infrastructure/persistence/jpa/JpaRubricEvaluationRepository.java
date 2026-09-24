package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.RubricStage;
import com.internlink.core.domain.evaluation.RubricEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaRubricEvaluationRepository extends JpaRepository<RubricEvaluation, UUID> {
    List<RubricEvaluation> findByPlacementId(UUID placementId);
    Optional<RubricEvaluation> findByPlacementIdAndEvaluatorIdAndEvaluationStage(UUID placementId, UUID evaluatorId, RubricStage stage);
}
