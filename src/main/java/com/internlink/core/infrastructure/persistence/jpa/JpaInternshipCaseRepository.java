package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.CaseStatus;
import com.internlink.core.shared.enums.CaseType;
import com.internlink.core.domain.exception_case.InternshipCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;



@Repository
public interface JpaInternshipCaseRepository extends JpaRepository<InternshipCase, UUID> {
    List<InternshipCase> findByPlacementId(UUID placementId);
    List<InternshipCase> findByStatus(CaseStatus status);
    List<InternshipCase> findByCaseType(CaseType caseType);
    List<InternshipCase> findByReportedByUserId(UUID reportedByUserId);
    List<InternshipCase> findByAssignedToUserId(UUID assignedToUserId);
}
