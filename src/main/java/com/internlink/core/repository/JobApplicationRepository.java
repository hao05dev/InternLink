package com.internlink.core.repository;

import com.internlink.core.common.enums.ApplicationStatus;
import com.internlink.core.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    List<JobApplication> findByStudentId(UUID studentId);
    List<JobApplication> findByJobId(UUID jobId);
    Optional<JobApplication> findByJobIdAndStudentId(UUID jobId, UUID studentId);
    List<JobApplication> findByJobIdAndStatus(UUID jobId, ApplicationStatus status);
    boolean existsByJobIdAndStudentId(UUID jobId, UUID studentId);
}
