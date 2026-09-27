package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.placement.InternshipReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaInternshipReportRepository extends JpaRepository<InternshipReport, UUID> {
    List<InternshipReport> findByPlacementId(UUID placementId);
    Optional<InternshipReport> findByPlacementIdAndReportType(UUID placementId, String reportType);
}
