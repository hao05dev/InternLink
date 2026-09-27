package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.evaluation.AssessmentComponentScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaAssessmentComponentScoreRepository extends JpaRepository<AssessmentComponentScore, UUID> {
    List<AssessmentComponentScore> findByPlacementId(UUID placementId);
    Optional<AssessmentComponentScore> findByPlacementIdAndComponentCode(UUID placementId, String componentCode);
}
