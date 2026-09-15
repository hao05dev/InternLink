package com.internlink.core.repository;

import com.internlink.core.entity.AgreementAmendment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgreementAmendmentRepository extends JpaRepository<AgreementAmendment, Long> {

    List<AgreementAmendment> findByLearningAgreementIdOrderByVersionNumberDesc(Long agreementId);
}