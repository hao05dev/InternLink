package com.internlink.core.repository;

import com.internlink.core.entity.LearningAgreement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LearningAgreementRepository extends JpaRepository<LearningAgreement, Long> {

    Optional<LearningAgreement> findByApplicationId(Long applicationId);

    List<LearningAgreement> findByStudentId(Long studentId);

    List<LearningAgreement> findByAcademicSupervisorId(Long supervisorId);

    List<LearningAgreement> findByCompanyMentorId(Long mentorId);
}