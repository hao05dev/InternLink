package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.evaluation.AssessmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaAssessmentSchemeRepository extends JpaRepository<AssessmentScheme, UUID> {
    List<AssessmentScheme> findByTermId(UUID termId);
    Optional<AssessmentScheme> findByTermIdAndProgramIdAndCohortCodeAndStatus(
        UUID termId, UUID programId, String cohortCode, String status);
    boolean existsByTermIdAndProgramIdAndCohortCodeAndCourseCodeAndRevision(
        UUID termId, UUID programId, String cohortCode, String courseCode, Integer revision);
    boolean existsByTermIdAndProgramIdAndCohortCodeAndCourseCodeAndStatus(
        UUID termId, UUID programId, String cohortCode, String courseCode, String status);
    boolean existsByProgram_Id(UUID programId);
}
