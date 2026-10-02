package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.domain.ai_matching.StudentSkillId;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.JpaAiRunRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.SkillSource;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiCvProcessingHandler {

    private final JpaUserRepository userRepository;
    private final JpaDocumentRepository documentRepository;
    private final JpaAiRunRepository aiRunRepository;
    private final JpaSkillTaxonomyRepository taxonomyRepository;
    private final JpaStudentSkillRepository studentSkillRepository;
    private final AiServiceClient aiServiceClient;
    private final AiMatchingMapper mapper;
    private final SecurityGuard securityGuard;

    public record CvProcessingResult(AiRun run, List<StudentSkillResponse> skills) {}

    public CvProcessingResult processCvSkills(UUID studentId, UUID documentId, String cvText,
                                             Map<String, Object> context) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        if (cvText == null || cvText.isBlank() || cvText.length() > 100000) {
            throw new BadRequestException("Nội dung CV phải có từ 1 đến 100.000 ký tự");
        }
        Document cvDocument = null;
        if (documentId != null) {
            cvDocument = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
            if (!cvDocument.getOwner().getId().equals(studentId)
                || cvDocument.getDocumentType() != DocumentType.CV) {
                throw new ForbiddenException("Tài liệu nguồn phải là CV thuộc sở hữu của sinh viên");
            }
        }

        // 1. Gọi sang AI Microservice để trích xuất kỹ năng
        OffsetDateTime startedAt = OffsetDateTime.now();
        Map<String, Object> aiResult = aiServiceClient.extractSkills(cvText);
        boolean failed = Set.of("FAILED", "EMPTY_RESPONSE").contains(aiResult.getOrDefault("status", ""));
        Map<String, Object> snapshot = new HashMap<>(context);
        snapshot.put("text_length", cvText.length());

        // 2. Ghi nhật ký chạy AI (ai_runs)
        AiRun run = AiRun.builder()
            .runType(AiRunType.CV_EXTRACTION)
            .student(student)
            .sourceDocument(cvDocument)
            .status(failed ? AiRunStatus.FAILED : AiRunStatus.COMPLETED)
            .modelName(String.valueOf(aiResult.getOrDefault("model", "skills-extraction-transformer")))
            .inputHash(Integer.toHexString(cvText != null ? cvText.hashCode() : 0))
            .inputSnapshot(snapshot)
            .outputResult(aiResult)
            .errorDetail(failed ? Map.of("message", "Dịch vụ AI không trả được kết quả trích xuất. Kiểm tra kết nối và thử lại.") : null)
            .startedAt(startedAt)
            .completedAt(OffsetDateTime.now())
            .build();
        aiRunRepository.save(run);
        if (failed) return new CvProcessingResult(run, List.of());

        // 3. Phân tích kết quả và lưu vào student_skills
        List<Map<String, Object>> extractedSkills = mapper.extractSkillItems(aiResult);
        List<StudentSkill> skillsToSave = new ArrayList<>();

        for (Map<String, Object> item : extractedSkills) {
            String skillId = mapper.getString(item, "skill_id", "id");
            if (skillId == null) continue;

            Optional<SkillTaxonomy> taxonomyOpt = taxonomyRepository.findById(skillId);
            if (taxonomyOpt.isEmpty()) continue;

            StudentSkillId id = new StudentSkillId(studentId, skillId);
            Optional<StudentSkill> existing = studentSkillRepository.findById(id);
            if (existing.isPresent() && (existing.get().getSource() != SkillSource.CV_AI
                    || Boolean.TRUE.equals(existing.get().getIsConfirmed()))) {
                continue;
            }
            StudentSkill studentSkill = existing.orElse(StudentSkill.builder()
                    .id(id)
                    .student(student)
                    .skill(taxonomyOpt.get())
                    .source(SkillSource.CV_AI)
                    .build());

            Object conf = item.get("confidence");
            if (conf instanceof Number num) {
                studentSkill.setConfidence(BigDecimal.valueOf(num.doubleValue()));
            }

            // HUMAN-IN-THE-LOOP: Kỹ năng do AI tự động trích xuất từ CV phải để ở trạng thái
            // chưa xác nhận (isConfirmed = false) để sinh viên rà soát và xác nhận thủ công.
            studentSkill.setIsConfirmed(false);
            studentSkill.setEvidenceDocument(cvDocument);

            skillsToSave.add(studentSkill);
        }

        List<StudentSkill> saved = studentSkillRepository.saveAll(skillsToSave);
        return new CvProcessingResult(run, saved.stream().map(mapper::toStudentSkillResponse).toList());
    }

    public UUID reprocessFailedCvRun(UUID runId, String cvText) {
        securityGuard.requireRole(UserRole.ADMIN);
        AiRun original = aiRunRepository.findForRetryById(runId)
            .orElseThrow(() -> new ResourceNotFoundException("AiRun", "id", runId));
        if (original.getRunType() != AiRunType.CV_EXTRACTION
                || original.getStatus() != AiRunStatus.FAILED || original.getStudent() == null) {
            throw new BadRequestException("Chỉ có thể xử lý lại lượt trích xuất CV bị lỗi có sinh viên nguồn");
        }
        Map<String, Object> snapshot = new HashMap<>(original.getInputSnapshot());
        if (snapshot.containsKey("retry_run_id")) {
            throw new BadRequestException("Lượt này đã được xử lý lại. Hãy xem lượt xử lý mới nhất");
        }
        CvProcessingResult result = processCvSkills(original.getStudent().getId(),
            original.getSourceDocument() != null ? original.getSourceDocument().getId() : null,
            cvText, Map.of("retry_of", runId.toString()));
        snapshot.put("retry_run_id", result.run().getId().toString());
        original.setInputSnapshot(snapshot);
        aiRunRepository.save(original);
        return result.run().getId();
    }
}
