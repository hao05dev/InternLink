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
    List<ReportTemplateVersion> findByTermIdOrderByCreatedAtDesc(UUID termId);
    List<ReportTemplateVersion> findByTermIdAndDepartmentIdOrderByCreatedAtDesc(UUID termId, UUID departmentId);
    List<ReportTemplateVersion> findByTermIdAndReportTypeOrderByVersionNumberDesc(UUID termId, ReportTemplateType reportType);

    Optional<ReportTemplateVersion> findFirstByTermIdAndReportTypeAndProgramCodeAndIsActiveTrueOrderByVersionNumberDesc(
            UUID termId, ReportTemplateType reportType, String programCode);

    Optional<ReportTemplateVersion> findFirstByTermIdAndReportTypeAndProgramCodeOrderByVersionNumberDesc(
            UUID termId, ReportTemplateType reportType, String programCode);

    Optional<ReportTemplateVersion> findFirstByTermIdAndReportTypeAndIsActiveTrueOrderByVersionNumberDesc(
            UUID termId, ReportTemplateType reportType);

    Optional<ReportTemplateVersion> findFirstByTermIdAndReportTypeOrderByVersionNumberDesc(
            UUID termId, ReportTemplateType reportType);

    Optional<ReportTemplateVersion> findFirstByTermIdAndDepartmentIdAndReportTypeOrderByVersionNumberDesc(
            UUID termId, UUID departmentId, ReportTemplateType reportType);
}
