package com.internlink.core.repository;

import com.internlink.core.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(Job.JobStatus status);
    List<Job> findByCompanyId(Long companyId);
}
