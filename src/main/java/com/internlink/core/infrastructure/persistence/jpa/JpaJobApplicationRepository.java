package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.domain.recruitment.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaJobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByStudentId(UUID studentId);
    List<JobApplication> findByJobId(UUID jobId);
    Optional<JobApplication> findByJobIdAndStudentId(UUID jobId, UUID studentId);
    List<JobApplication> findByJobIdAndStatus(UUID jobId, ApplicationStatus status);
    boolean existsByJobIdAndStudentId(UUID jobId, UUID studentId);
}
