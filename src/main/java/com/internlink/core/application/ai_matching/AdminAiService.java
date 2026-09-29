package com.internlink.core.application.ai_matching;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.JpaAiRunRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.presentation.ai_matching.dto.response.AdminAiResponse.*;
import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminAiService {
    private final JpaAiRunRepository runRepository;
    private final JpaSkillTaxonomyRepository taxonomyRepository;
    private final AiServiceClient aiServiceClient;
    private final AiMatchingService matchingService;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Stats stats() {
        securityGuard.requireRole(UserRole.ADMIN);
        return new Stats(runRepository.count(), runRepository.countByStatus(AiRunStatus.COMPLETED),
            runRepository.countByStatus(AiRunStatus.FAILED), runRepository.countByStatus(AiRunStatus.PENDING),
            runRepository.countByStatus(AiRunStatus.RUNNING));
    }

    public Health health() {
        securityGuard.requireRole(UserRole.ADMIN);
        Map<String, Object> result = aiServiceClient.health();
        return new Health("healthy".equals(result.get("status")),
            Boolean.TRUE.equals(result.get("gemini_api_configured")),
            (String) result.get("extraction_model"), (String) result.get("embedding_model"), OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public RunPage runs(AiRunStatus status, AiRunType type, String search, int page, int size) {
        securityGuard.requireRole(UserRole.ADMIN);
        if (page < 0 || size < 1 || size > 100 || (search != null && search.length() > 150)) {
            throw new BadRequestException("Bộ lọc hoặc phân trang không hợp lệ");
        }
        Specification<AiRun> filter = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (type != null) predicates.add(cb.equal(root.get("runType"), type));
            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase(java.util.Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                var student = root.join("student", JoinType.LEFT);
                var job = root.join("job", JoinType.LEFT);
                predicates.add(cb.or(cb.like(cb.lower(student.get("fullName")), term, '\\'),
                    cb.like(cb.lower(student.get("email")), term, '\\'),
                    cb.like(cb.lower(job.get("title")), term, '\\'),
                    cb.like(cb.lower(root.get("modelName")), term, '\\')));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        var result = runRepository.findAll(filter, PageRequest.of(page, size,
            Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
        return new RunPage(result.getContent().stream().map(this::mapRun).toList(),
            result.getTotalElements(), result.getTotalPages(), result.getNumber());
    }

    @Transactional(readOnly = true)
    public Detail detail(UUID id) {
        securityGuard.requireRole(UserRole.ADMIN);
        return mapDetail(runRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AiRun", "id", id)));
    }

    @Transactional(readOnly = true)
    public List<Taxonomy> taxonomy() {
        securityGuard.requireRole(UserRole.ADMIN);
        return taxonomyRepository.findAll(Sort.by("skillName")).stream().map(skill -> new Taxonomy(
            skill.getId(), skill.getSkillName(), skill.getCategory(), skill.getFramework(),
            skill.getDescription(), skill.getAliases(), skill.getTaxonomyVersion(),
            skill.getIsActive(), skill.getUpdatedAt())).toList();
    }

    @Transactional
    public Detail retry(UUID id, String cvText) {
        securityGuard.requireRole(UserRole.ADMIN);
        UUID newId = matchingService.reprocessFailedCvRun(id, cvText);
        Detail result = detail(newId);
        auditLogService.logAction(securityGuard.currentUser().getId(), "AI_CV_RETRY", "AI_RUN", newId,
            result.run().status() == AiRunStatus.COMPLETED ? "SUCCESS" : "FAILED",
            Map.of("retryOf", id.toString()), null);
        return result;
    }

    private Detail mapDetail(AiRun run) {
        return new Detail(mapRun(run), run.getInputSnapshot(), run.getOutputResult(), run.getErrorDetail());
    }

    private Run mapRun(AiRun run) {
        return new Run(run.getId(), run.getRunType(), run.getStatus(),
            run.getStudent() != null ? run.getStudent().getId() : null,
            run.getStudent() != null ? run.getStudent().getFullName() : null,
            run.getStudent() != null ? run.getStudent().getEmail() : null,
            run.getSourceDocument() != null ? run.getSourceDocument().getId() : null,
            run.getJob() != null ? run.getJob().getId() : null,
            run.getJob() != null ? run.getJob().getTitle() : null,
            run.getModelName(), run.getModelVersion(), run.getTaxonomyVersion(), run.getCreatedAt(),
            run.getStartedAt(), run.getCompletedAt(), run.getRunType() == AiRunType.CV_EXTRACTION
                && run.getStatus() == AiRunStatus.FAILED && run.getStudent() != null
                && !run.getInputSnapshot().containsKey("retry_run_id"));
    }
}
