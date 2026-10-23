package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.shared.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaJobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    List<JobApplication> findByStudentId(UUID studentId);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    Page<JobApplication> findByStudentId(UUID studentId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    List<JobApplication> findByJobId(UUID jobId);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    Page<JobApplication> findByJobId(UUID jobId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    List<JobApplication> findByJobCompanyId(UUID companyId);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    Optional<JobApplication> findByJobIdAndStudentId(UUID jobId, UUID studentId);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    List<JobApplication> findBySubmittedCvDocumentId(UUID documentId);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    List<JobApplication> findByJobIdAndStatus(UUID jobId, ApplicationStatus status);

    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    List<JobApplication> findByJobIdIn(List<UUID> jobIds);

    @Override
    @EntityGraph(attributePaths = {"job", "job.company", "student", "submittedCvDocument"})
    Optional<JobApplication> findById(UUID id);

    boolean existsByJobIdAndStudentId(UUID jobId, UUID studentId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.job.id = :jobId AND a.status IN ('OFFERED', 'REVIEWING', 'INTERVIEWING')")
    long countActiveApplicationsByJob(@Param("jobId") UUID jobId);

    @Query("""
        SELECT COUNT(a) FROM JobApplication a
        WHERE a.student.id = :studentId
          AND a.job.term.id = :termId
          AND a.status NOT IN ('REJECTED', 'WITHDRAWN')
        """)
    long countActiveApplicationsByStudentInTerm(@Param("studentId") UUID studentId,
                                                 @Param("termId") UUID termId);
}
