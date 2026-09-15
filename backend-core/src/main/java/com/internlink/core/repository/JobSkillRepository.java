package com.internlink.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.internlink.core.entity.JobSkill;
import com.internlink.core.entity.JobSkillId;

public interface JobSkillRepository extends JpaRepository<JobSkill, JobSkillId> {
    List<JobSkill> findByIdJobId(Long jobId);

    void deleteByIdJobId(Long jobId);
}
