package com.internlink.core.repository;

import com.internlink.core.entity.TermStudentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TermStudentRegistrationRepository extends JpaRepository<TermStudentRegistration, Long> {

    List<TermStudentRegistration> findByInternshipTermId(Long termId);

    Optional<TermStudentRegistration> findByInternshipTermIdAndStudentProfileId(Long termId, Long studentProfileId);

    boolean existsByInternshipTermIdAndStudentProfileId(Long termId, Long studentProfileId);
}