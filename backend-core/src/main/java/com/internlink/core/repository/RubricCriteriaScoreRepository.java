package com.internlink.core.repository;

import com.internlink.core.entity.RubricCriteriaScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RubricCriteriaScoreRepository extends JpaRepository<RubricCriteriaScore, Long> {

    List<RubricCriteriaScore> findByEvaluationId(Long evaluationId);

    List<RubricCriteriaScore> findByEvaluationIdIn(List<Long> evaluationIds);

    Optional<RubricCriteriaScore> findByEvaluationIdAndCompetencyCode(Long evaluationId, String competencyCode);

    void deleteByEvaluationId(Long evaluationId);
}
