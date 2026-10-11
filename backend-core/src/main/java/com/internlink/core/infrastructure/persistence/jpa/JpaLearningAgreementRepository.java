package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.shared.enums.AgreementStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaLearningAgreementRepository extends JpaRepository<LearningAgreement, UUID> {

    @Override
    @EntityGraph(attributePaths = {"offer", "offer.proposedMentor", "student", "company", "department"})
    Optional<LearningAgreement> findById(UUID id);

    @EntityGraph(attributePaths = {"offer", "offer.proposedMentor", "student", "company", "department"})
    Optional<LearningAgreement> findByOfferId(UUID offerId);

    @EntityGraph(attributePaths = {"offer", "offer.proposedMentor", "student", "company", "department"})
    List<LearningAgreement> findByStudentId(UUID studentId);

    @EntityGraph(attributePaths = {"offer", "offer.proposedMentor", "student", "company", "department"})
    List<LearningAgreement> findByCompanyId(UUID companyId);

    @EntityGraph(attributePaths = {"offer", "offer.proposedMentor", "student", "company", "department"})
    List<LearningAgreement> findByDepartmentId(UUID departmentId);

    @EntityGraph(attributePaths = {"offer", "offer.proposedMentor", "student", "company", "department"})
    List<LearningAgreement> findByDepartmentIdAndStatus(UUID departmentId, AgreementStatus status);
}
