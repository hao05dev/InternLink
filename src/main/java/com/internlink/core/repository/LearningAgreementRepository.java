package com.internlink.core.repository;

import com.internlink.core.common.enums.AgreementStatus;
import com.internlink.core.entity.LearningAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningAgreementRepository extends JpaRepository<LearningAgreement, UUID> {
    Optional<LearningAgreement> findByOfferId(UUID offerId);
    List<LearningAgreement> findByStudentId(UUID studentId);
    List<LearningAgreement> findByCompanyId(UUID companyId);
    List<LearningAgreement> findByDepartmentId(UUID departmentId);
    List<LearningAgreement> findByDepartmentIdAndStatus(UUID departmentId, AgreementStatus status);
}
