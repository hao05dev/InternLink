package com.internlink.core.repository;

import com.internlink.core.entity.RubricEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RubricEvaluationRepository extends JpaRepository<RubricEvaluation, Long> {
    List<RubricEvaluation> findByLearningAgreementId(Long agreementId);
}
