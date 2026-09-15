package com.internlink.core.repository;

import com.internlink.core.entity.InternshipIncident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternshipIncidentRepository extends JpaRepository<InternshipIncident, Long> {

    List<InternshipIncident> findByLearningAgreementId(Long agreementId);

    List<InternshipIncident> findByResolutionStatus(String status);
}