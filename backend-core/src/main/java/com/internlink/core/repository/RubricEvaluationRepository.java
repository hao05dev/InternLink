package com.internlink.core.repository;

import com.internlink.core.entity.RubricEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RubricEvaluationRepository extends JpaRepository<RubricEvaluation, Long> {

    List<RubricEvaluation> findByLearningAgreementId(Long learningAgreementId);

    List<RubricEvaluation> findByLearningAgreementIdAndEvaluationType(Long learningAgreementId, String evaluationType);

    Optional<RubricEvaluation> findByLearningAgreementIdAndEvaluationTypeAndEvaluatorRoleAndEvaluatorUserId(
            Long learningAgreementId, String evaluationType, String evaluatorRole, Long evaluatorUserId);

    List<RubricEvaluation> findByEvaluatorUserId(Long evaluatorUserId);
}
