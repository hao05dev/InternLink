package com.internlink.core.repository;

import com.internlink.core.entity.SupervisorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupervisorAssignmentRepository extends JpaRepository<SupervisorAssignment, Long> {

    List<SupervisorAssignment> findByInternshipTermId(Long termId);

    List<SupervisorAssignment> findByLecturerUserIdAndStatus(Long lecturerUserId, String status);

    Optional<SupervisorAssignment> findByInternshipTermIdAndStudentProfileId(Long termId, Long studentProfileId);
}