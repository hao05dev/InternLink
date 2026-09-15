package com.internlink.core.repository;

import com.internlink.core.entity.SatisfactionSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SatisfactionSurveyRepository extends JpaRepository<SatisfactionSurvey, Long> {

    List<SatisfactionSurvey> findByLearningAgreementId(Long learningAgreementId);

    List<SatisfactionSurvey> findBySubmittedByUserId(Long submittedByUserId);

    Optional<SatisfactionSurvey> findByLearningAgreementIdAndSubmittedByUserId(Long learningAgreementId, Long submittedByUserId);
}
