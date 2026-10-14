package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.organization.ReportTemplateVersion;
import com.internlink.core.shared.enums.ReportTemplateType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaReportTemplateVersionRepository extends JpaRepository<ReportTemplateVersion, UUID> {
    List<ReportTemplateVersion> findByTermIdAndIsActiveTrue(UUID termId);
    List<ReportTemplateVersion> findByTermIdAndDepartmentIdAndIsActiveTrue(UUID termId, UUID departmentId);
    Optional<ReportTemplateVersion> findFirstByTermIdAndReportTypeAndIsActiveTrueOrderByVersionNumberDesc(
            UUID termId, ReportTemplateType reportType);
}
