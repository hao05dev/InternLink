package com.internlink.core.repository;

import com.internlink.core.entity.JobSkill;
import com.internlink.core.entity.JobSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, JobSkillId> {
    List<JobSkill> findByJobId(UUID jobId);
}
