package com.internlink.core.repository;

import com.internlink.core.common.enums.JobStatus;
import com.internlink.core.entity.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, UUID> {
    List<JobPosition> findByCompanyId(UUID companyId);
    List<JobPosition> findByTermId(UUID termId);
    List<JobPosition> findByTermIdAndStatus(UUID termId, JobStatus status);
    List<JobPosition> findByDepartmentIdAndStatus(UUID departmentId, JobStatus status);
}
