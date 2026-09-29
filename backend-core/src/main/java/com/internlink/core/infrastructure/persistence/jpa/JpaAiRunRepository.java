package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.domain.ai_matching.AiRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.LockModeType;
import com.internlink.core.shared.enums.AiRunStatus;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaAiRunRepository extends JpaRepository<AiRun, UUID>, JpaSpecificationExecutor<AiRun> {
    @Override
    @EntityGraph(attributePaths = {"student", "sourceDocument", "job"})
    Page<AiRun> findAll(Specification<AiRun> specification, Pageable pageable);

    long countByStatus(AiRunStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from AiRun r where r.id = :id")
    Optional<AiRun> findForRetryById(@Param("id") UUID id);

    List<AiRun> findByStudentId(UUID studentId);
    List<AiRun> findByJobId(UUID jobId);
    Optional<AiRun> findByInputHash(String inputHash);
    List<AiRun> findByStudentIdAndRunType(UUID studentId, AiRunType runType);
}
