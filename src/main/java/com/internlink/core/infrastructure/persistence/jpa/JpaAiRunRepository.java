package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.domain.ai_matching.AiRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaAiRunRepository extends JpaRepository<AiRun, UUID> {
    List<AiRun> findByStudentId(UUID studentId);
    List<AiRun> findByJobId(UUID jobId);
    Optional<AiRun> findByInputHash(String inputHash);
    List<AiRun> findByStudentIdAndRunType(UUID studentId, AiRunType runType);
}
