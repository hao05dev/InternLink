package com.internlink.core.repository;

import com.internlink.core.common.enums.CaseStatus;
import com.internlink.core.common.enums.CaseType;
import com.internlink.core.entity.InternshipCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InternshipCaseRepository extends JpaRepository<InternshipCase, UUID> {
    List<InternshipCase> findByPlacementId(UUID placementId);
    List<InternshipCase> findByStatus(CaseStatus status);
    List<InternshipCase> findByCaseType(CaseType caseType);
    List<InternshipCase> findByReportedByUserId(UUID reportedByUserId);
    List<InternshipCase> findByAssignedToUserId(UUID assignedToUserId);
}
