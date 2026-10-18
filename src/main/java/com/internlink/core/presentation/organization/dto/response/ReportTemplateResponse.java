package com.internlink.core.presentation.organization.dto.response;

import com.internlink.core.domain.organization.ReportTemplateVersion;
import com.internlink.core.shared.enums.ReportTemplateType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record ReportTemplateResponse(
    UUID id,
    UUID termId,
    String termName,
    UUID departmentId,
    String departmentName,
    UUID programId,
    String programCode,
    String programName,
    String title,
    String description,
    ReportTemplateType reportType,
    String fileUrl,
    String fileName,
    Long fileSizeBytes,
    String mimeType,
    Integer versionNumber,
    Boolean isMandatory,
    Boolean isActive,
    String uploadedByName,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
    public static ReportTemplateResponse fromEntity(ReportTemplateVersion entity) {
        return ReportTemplateResponse.builder()
            .id(entity.getId())
            .termId(entity.getTerm() != null ? entity.getTerm().getId() : null)
            .termName(entity.getTerm() != null ? entity.getTerm().getTermName() : null)
            .departmentId(entity.getDepartment() != null ? entity.getDepartment().getId() : null)
            .departmentName(entity.getDepartment() != null ? entity.getDepartment().getName() : null)
            .programId(entity.getProgram() != null ? entity.getProgram().getId() : null)
            .programCode(entity.getProgramCode())
            .programName(entity.getProgram() != null ? entity.getProgram().getName() : null)
            .title(entity.getTitle())
            .description(entity.getDescription())
            .reportType(entity.getReportType())
            .fileUrl(entity.getFileUrl())
            .fileName(entity.getFileName())
            .fileSizeBytes(entity.getFileSizeBytes())
            .mimeType(entity.getMimeType())
            .versionNumber(entity.getVersionNumber())
            .isMandatory(entity.getIsMandatory())
            .isActive(entity.getIsActive())
            .uploadedByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : null)
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
