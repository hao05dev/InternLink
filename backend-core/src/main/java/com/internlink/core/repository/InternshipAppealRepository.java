package com.internlink.core.repository;

import com.internlink.core.entity.InternshipAppeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipAppealRepository extends JpaRepository<InternshipAppeal, Long> {

    List<InternshipAppeal> findByLearningAgreementId(Long learningAgreementId);

    List<InternshipAppeal> findByStudentUserId(Long studentUserId);

    List<InternshipAppeal> findByStatus(String status);
}
