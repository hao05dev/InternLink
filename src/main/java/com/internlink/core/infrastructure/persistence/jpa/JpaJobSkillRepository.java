package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.domain.recruitment.JobSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;



@Repository
public interface JpaJobSkillRepository extends JpaRepository<JobSkill, JobSkillId> {
    List<JobSkill> findByIdJobId(UUID jobId);
    List<JobSkill> findByJob_Id(UUID jobId);
    List<JobSkill> findByJobId(UUID jobId);
}
