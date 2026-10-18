package com.internlink.core.application.organization;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.ReportTemplateVersion;
import com.internlink.core.infrastructure.integration.storage.StorageService;
import com.internlink.core.infrastructure.integration.storage.StorageServiceRouter;
import com.internlink.core.infrastructure.integration.storage.StoredFileInfo;
import com.internlink.core.infrastructure.persistence.jpa.JpaAcademicProgramRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipTermRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaReportTemplateVersionRepository;
import com.internlink.core.presentation.organization.dto.response.ReportTemplateResponse;
import com.internlink.core.shared.enums.ReportTemplateType;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportTemplateService {

    private final JpaReportTemplateVersionRepository templateRepository;
    private final JpaInternshipTermRepository termRepository;
    private final JpaDepartmentRepository departmentRepository;
    private final JpaAcademicProgramRepository programRepository;
    private final StorageServiceRouter storageServiceRouter;

    @Transactional(readOnly = true)
    public List<ReportTemplateResponse> getTemplates(UUID termId, UUID departmentId, Boolean activeOnly) {
        List<ReportTemplateVersion> list;
        boolean onlyActive = activeOnly == null || activeOnly;

        if (departmentId != null) {
            list = onlyActive
                ? templateRepository.findByTermIdAndDepartmentIdAndIsActiveTrue(termId, departmentId)
                : templateRepository.findByTermIdAndDepartmentIdOrderByCreatedAtDesc(termId, departmentId);
        } else {
            list = onlyActive
                ? templateRepository.findByTermIdAndIsActiveTrue(termId)
                : templateRepository.findByTermIdOrderByCreatedAtDesc(termId);
        }

        return list.stream().map(ReportTemplateResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ReportTemplateResponse getEvaluationTemplateForStudent(UUID termId, String programCode) {
        String code = programCode != null ? programCode.trim().toUpperCase() : "DEFAULT";
        Optional<ReportTemplateVersion> template = templateRepository
            .findFirstByTermIdAndReportTypeAndProgramCodeAndIsActiveTrueOrderByVersionNumberDesc(
                termId, ReportTemplateType.M04, code);

        if (template.isEmpty()) {
            template = templateRepository
                .findFirstByTermIdAndReportTypeAndProgramCodeAndIsActiveTrueOrderByVersionNumberDesc(
                    termId, ReportTemplateType.M04, "DEFAULT");
        }

        if (template.isEmpty()) {
            template = templateRepository
                .findFirstByTermIdAndReportTypeAndIsActiveTrueOrderByVersionNumberDesc(
                    termId, ReportTemplateType.M04);
        }

        return template.map(ReportTemplateResponse::fromEntity).orElse(null);
    }

    @Transactional
    public ReportTemplateResponse uploadTemplate(
        UUID termId,
        UUID departmentId,
        UUID programId,
        String programCode,
        ReportTemplateType reportType,
        String title,
        String description,
        Boolean isMandatory,
        MultipartFile file,
        User uploader
    ) {
        verifyFacultyAdminOrAdmin(uploader);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tin biểu mẫu không được để trống");
        }

        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));

        Department department = departmentId != null
            ? departmentRepository.findById(departmentId).orElse(null)
            : term.getDepartment();

        AcademicProgram program = null;
        String resolvedProgramCode = programCode != null && !programCode.isBlank()
            ? programCode.trim().toUpperCase()
            : "DEFAULT";

        if (programId != null) {
            program = programRepository.findById(programId).orElse(null);
            if (program != null && (programCode == null || programCode.isBlank())) {
                resolvedProgramCode = program.getCode();
            }
        }

        int nextVersion = 1;
        Optional<ReportTemplateVersion> latest = templateRepository
            .findFirstByTermIdAndReportTypeAndProgramCodeOrderByVersionNumberDesc(termId, reportType, resolvedProgramCode);
        if (latest.isPresent()) {
            nextVersion = latest.get().getVersionNumber() + 1;
        }

        StorageService storage = storageServiceRouter.getActiveStorageService();
        String subFolder = "templates/" + termId;
        StoredFileInfo stored = storage.store(file, subFolder);

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = reportType.name() + ".docx";
        }

        String mimeType = file.getContentType();
        if (mimeType == null || mimeType.isBlank()) {
            mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        String fileUrl = stored.getStoragePathOrUrl() != null ? stored.getStoragePathOrUrl() : stored.getProviderFileId();

        ReportTemplateVersion entity = ReportTemplateVersion.builder()
            .term(term)
            .department(department)
            .program(program)
            .programCode(resolvedProgramCode)
            .title(title != null && !title.isBlank() ? title : originalName)
            .description(description)
            .reportType(reportType)
            .fileUrl(fileUrl)
            .fileName(originalName)
            .fileSizeBytes(file.getSize())
            .mimeType(mimeType)
            .versionNumber(nextVersion)
            .isMandatory(isMandatory != null ? isMandatory : true)
            .isActive(true)
            .createdBy(uploader)
            .build();

        return ReportTemplateResponse.fromEntity(templateRepository.save(entity));
    }

    @Transactional
    public ReportTemplateResponse toggleActive(UUID templateId, User actor) {
        verifyFacultyAdminOrAdmin(actor);
        ReportTemplateVersion entity = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("ReportTemplateVersion", "id", templateId));
        entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
        return ReportTemplateResponse.fromEntity(templateRepository.save(entity));
    }

    @Transactional
    public void deleteTemplate(UUID templateId, User actor) {
        verifyFacultyAdminOrAdmin(actor);
        ReportTemplateVersion entity = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("ReportTemplateVersion", "id", templateId));
        templateRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public Resource loadTemplateResource(UUID templateId) {
        ReportTemplateVersion entity = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("ReportTemplateVersion", "id", templateId));
        StorageService storage = storageServiceRouter.getActiveStorageService();
        return storage.loadAsResource(entity.getFileUrl());
    }

    private void verifyFacultyAdminOrAdmin(User user) {
        if (user == null || (user.getRole() != UserRole.FACULTY_ADMIN && user.getRole() != UserRole.ADMIN)) {
            throw new ForbiddenException("Chỉ Quản lý Khoa hoặc Quản trị viên mới có quyền quản lý biểu mẫu");
        }
    }
}
