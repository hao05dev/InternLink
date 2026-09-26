package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.domain.recruitment.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /** Đếm số hồ sơ đã được ACCEPTED/OFFERED cho một vị trí — dùng kiểm tra chỉ tiêu. */
    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.job.id = :jobId AND a.status IN ('OFFERED', 'REVIEWING', 'INTERVIEWING')")
    long countActiveApplicationsByJob(@Param("jobId") UUID jobId);

    /**
     * Đếm số hồ sơ còn đang hoạt động của sinh viên trong một kỳ thực tập.
     * Dùng để giới hạn số đơn ứng tuyển đồng thời (tránh spam).
     */
    @Query("""
        SELECT COUNT(a) FROM JobApplication a
        WHERE a.student.id = :studentId
          AND a.job.term.id = :termId
          AND a.status NOT IN ('REJECTED', 'WITHDRAWN')
        """)
    long countActiveApplicationsByStudentInTerm(@Param("studentId") UUID studentId,
                                                 @Param("termId") UUID termId);
}
