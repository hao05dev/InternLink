package com.internlink.core.repository;

import com.internlink.core.common.enums.AiRunType;
import com.internlink.core.entity.AiRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiRunRepository extends JpaRepository<AiRun, UUID> {
    List<AiRun> findByStudentId(UUID studentId);
    List<AiRun> findByJobId(UUID jobId);
    Optional<AiRun> findByInputHash(String inputHash);
    List<AiRun> findByStudentIdAndRunType(UUID studentId, AiRunType runType);
}
