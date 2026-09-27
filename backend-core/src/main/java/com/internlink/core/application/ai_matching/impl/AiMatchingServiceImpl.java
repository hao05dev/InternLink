package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.application.ai_matching.AiMatchingService;
import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.domain.ai_matching.StudentSkillId;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.SkillTaxonomyResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.enums.SkillSource;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.ResourceAuthorization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiMatchingServiceImpl implements AiMatchingService {

    private final JpaSkillTaxonomyRepository taxonomyRepository;
    private final JpaStudentSkillRepository studentSkillRepository;
    private final JpaAiRunRepository aiRunRepository;
    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaJobSkillRepository jobSkillRepository;
    private final JpaUserRepository userRepository;
    private final JpaDocumentRepository documentRepository;
    private final JpaJobApplicationRepository applicationRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final AiServiceClient aiServiceClient;
    private final SecurityGuard securityGuard;

    @Override
    @Transactional(readOnly = true)
    public List<SkillTaxonomyResponse> getAllTaxonomySkills() {
        return taxonomyRepository.findAll().stream()
            .map(this::mapTaxonomyToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSkillResponse> getSkillsByStudent(UUID studentId) {
        UUID actorId = securityGuard.currentUser().getId();
        User actor = userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
        boolean isSelf = actorId.equals(studentId);
        boolean facultyAccess = actor.getRole() == UserRole.FACULTY_ADMIN
            && studentProfileRepository.findByUserId(studentId)
                .map(profile -> ResourceAuthorization.managesDepartment(
                    actor, profile.getProgram().getDepartment().getId())).orElse(false);
        boolean lecturerAccess = actor.getRole() == UserRole.LECTURER
            && placementRepository.findByStudentId(studentId).stream()
                .anyMatch(placement -> actorId.equals(placement.getLecturer().getId()));
        boolean companyAccess = actor.getRole() == UserRole.COMPANY_REP
            && applicationRepository.findByStudentId(studentId).stream()
                .anyMatch(app -> ResourceAuthorization.representsCompany(
                    actor, app.getJob().getCompany().getId()));
        ResourceAuthorization.require(isSelf || ResourceAuthorization.isAdmin(actor)
            || facultyAccess || lecturerAccess || companyAccess);
        return studentSkillRepository.findByIdStudentId(studentId).stream()
            .filter(skill -> isSelf || Boolean.TRUE.equals(skill.getIsConfirmed()))
            .map(this::mapStudentSkillToResponse)
            .toList();
    }

    @Override
    @Transactional
    public List<StudentSkillResponse> syncCvSkills(UUID studentId, UUID documentId, String cvText) {
        if (!studentId.equals(securityGuard.currentUser().getId())) {
            throw new ForbiddenException("Chỉ sinh viên sở hữu CV mới được đồng bộ kỹ năng");
        }
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        if (cvText == null || cvText.isBlank()) {
            throw new BadRequestException("Nội dung CV không được để trống");
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
        Map<String, Object> aiResult = aiServiceClient.extractSkills(cvText);

        // 2. Ghi nhật ký chạy AI (ai_runs)
        AiRun run = AiRun.builder()
            .runType(AiRunType.CV_EXTRACTION)
            .student(student)
            .sourceDocument(cvDocument)
            .status("FAILED".equals(aiResult.get("status")) ? AiRunStatus.FAILED : AiRunStatus.COMPLETED)
            .modelName("skills-extraction-transformer")
            .inputHash(Integer.toHexString(cvText != null ? cvText.hashCode() : 0))
            .inputSnapshot(Map.of("text_length", cvText != null ? cvText.length() : 0))
            .outputResult(aiResult)
            .startedAt(OffsetDateTime.now())
            .completedAt(OffsetDateTime.now())
            .build();
        aiRunRepository.save(run);

        // 3. Phân tích kết quả và lưu vào student_skills
        List<Map<String, Object>> extractedSkills = extractSkillItems(aiResult);
        List<StudentSkill> skillsToSave = new ArrayList<>();

        for (Map<String, Object> item : extractedSkills) {
            String skillId = getString(item, "skill_id", "id");
            if (skillId == null) continue;

            Optional<SkillTaxonomy> taxonomyOpt = taxonomyRepository.findById(skillId);
            if (taxonomyOpt.isEmpty()) continue;

            StudentSkillId id = new StudentSkillId(studentId, skillId);
            Optional<StudentSkill> existing = studentSkillRepository.findById(id);
            if (existing.isPresent() && existing.get().getSource() != SkillSource.CV_AI) {
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
        return saved.stream().map(this::mapStudentSkillToResponse).toList();
    }

    /**
     * Xác nhận hoặc từ chối kỹ năng của sinh viên (Human-in-the-loop).
     * Được bảo vệ bởi SecurityGuard (Anti-IDOR) đảm bảo chỉ đúng sinh viên mới xác nhận kỹ năng của mình.
     */
    @Override
    @Transactional
    public StudentSkillResponse confirmStudentSkill(UUID studentId, String skillId, Boolean confirmed) {
        // Anti-IDOR: chỉ sinh viên sở hữu hoặc Admin mới có quyền xác nhận kỹ năng
        UUID currentUserId = securityGuard.currentUser().getId();
        securityGuard.requireSelf(currentUserId, studentId, "StudentSkill");

        StudentSkillId id = new StudentSkillId(studentId, skillId);
        StudentSkill skill = studentSkillRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StudentSkill", "id", skillId));

        skill.setIsConfirmed(confirmed);
        return mapStudentSkillToResponse(studentSkillRepository.save(skill));
    }

    /**
     * Tính toán Match Score và Skill Gap giữa Sinh viên và Vị trí tuyển dụng.
     * Cung cấp đầy đủ ngữ cảnh (tiêu đề, mô tả vị trí) và phân tách rõ ràng
     * kỹ năng bắt buộc (MANDATORY) và mong muốn (OPTIONAL).
     */
    @Override
    @Transactional(readOnly = true)
    public AiMatchScoreResponse calculateMatchScoreForJob(UUID studentId, UUID jobId) {
        JobPosition job = jobPositionRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", jobId));

        // Chỉ lấy danh sách kỹ năng của sinh viên đã được xác nhận (Human-in-the-loop)
        List<String> studentSkills = studentSkillRepository.findByIdStudentIdAndIsConfirmedTrue(studentId)
            .stream().map(ss -> ss.getSkill().getId()).toList();

        // Lấy danh sách kỹ năng yêu cầu của Job và phân tách MANDATORY / OPTIONAL
        List<JobSkill> jobSkills = jobSkillRepository.findByIdJobId(jobId);

        List<String> mandatorySkillIds = jobSkills.stream()
            .filter(js -> js.getRequirementType() == RequirementType.MANDATORY)
            .map(js -> js.getSkill().getId())
            .toList();

        List<String> optionalSkillIds = jobSkills.stream()
            .filter(js -> js.getRequirementType() == RequirementType.OPTIONAL)
            .map(js -> js.getSkill().getId())
            .toList();

        String studentBio = studentProfileRepository.findByUserId(studentId)
            .map(profile -> profile.getBio())
            .orElse("");

        // Gọi AI Service với đầy đủ ngữ cảnh (tiêu đề, mô tả, mandatory vs optional)
        Map<String, Object> matchResult = aiServiceClient.calculateMatchScore(
            studentId,
            jobId,
            job.getTitle(),
            job.getDescription(),
            studentBio,
            studentSkills,
            mandatorySkillIds,
            optionalSkillIds
        );

        BigDecimal score = extractScore(matchResult);
        List<String> matched = extractStringList(matchResult.get("matched_skills"));
        List<String> missing = extractStringList(matchResult.get("missing_skills"));
        Map<String, Object> explanation = extractMap(matchResult.get("explanation"));

        return AiMatchScoreResponse.builder()
            .jobId(job.getId())
            .jobTitle(job.getTitle())
            .companyName(job.getCompany().getCompanyName())
            .matchScore(score)
            .matchedSkills(matched)
            .missingSkills(missing)
            .explanation(explanation)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiMatchScoreResponse> recommendJobsForStudent(UUID studentId, UUID termId) {
        // Lấy tất cả job đã được duyệt trong kỳ
        List<JobPosition> approvedJobs = jobPositionRepository.findByTermIdAndStatus(termId, JobStatus.APPROVED);

        List<AiMatchScoreResponse> recommendations = new ArrayList<>();
        for (JobPosition job : approvedJobs) {
            try {
                recommendations.add(calculateMatchScoreForJob(studentId, job.getId()));
            } catch (Exception ex) {
                log.warn("Bỏ qua tính điểm cho job {}: {}", job.getId(), ex.getMessage());
            }
        }

        // Sắp xếp giảm dần theo điểm phù hợp (Match Score)
        recommendations.sort((a, b) -> b.getMatchScore().compareTo(a.getMatchScore()));
        return recommendations;
    }

    private List<Map<String, Object>> extractSkillItems(Map<String, Object> aiResult) {
        Object rawSkills = aiResult.getOrDefault("skills", aiResult.get("normalized_skills"));
        if (!(rawSkills instanceof List<?> list)) {
            return List.of();
        }

        List<Map<String, Object>> skills = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> normalized = new HashMap<>();
                map.forEach((key, value) -> {
                    if (key != null) {
                        normalized.put(key.toString(), value);
                    }
                });
                skills.add(normalized);
            }
        }
        return skills;
    }

    private String getString(Map<String, Object> item, String... keys) {
        for (String key : keys) {
            Object value = item.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }

    private BigDecimal extractScore(Map<String, Object> matchResult) {
        Object scoreObj = matchResult.getOrDefault("match_score", matchResult.get("match_percentage"));
        if (scoreObj instanceof Number num) {
            return BigDecimal.valueOf(num.doubleValue());
        }
        if (scoreObj instanceof String text) {
            try {
                return new BigDecimal(text);
            } catch (NumberFormatException ignored) {
            }
        }
        return BigDecimal.ZERO;
    }

    @SuppressWarnings("unchecked")
    private List<String> extractStringList(Object obj) {
        if (obj instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractMap(Object obj) {
        if (obj instanceof Map<?, ?> map) {
            Map<String, Object> result = new HashMap<>();
            map.forEach((k, v) -> result.put(String.valueOf(k), v));
            return result;
        }
        return Map.of();
    }

    private SkillTaxonomyResponse mapTaxonomyToResponse(SkillTaxonomy entity) {
        return SkillTaxonomyResponse.builder()
            .id(entity.getId())
            .skillName(entity.getSkillName())
            .category(entity.getCategory())
            .framework(entity.getFramework())
            .description(entity.getDescription())
            .aliases(entity.getAliases())
            .build();
    }

    private StudentSkillResponse mapStudentSkillToResponse(StudentSkill entity) {
        return StudentSkillResponse.builder()
            .studentId(entity.getId().getStudentId())
            .skillId(entity.getSkill().getId())
            .skillName(entity.getSkill().getSkillName())
            .category(entity.getSkill().getCategory())
            .proficiencyLevel(entity.getProficiencyLevel())
            .source(entity.getSource())
            .confidence(entity.getConfidence())
            .isConfirmed(entity.getIsConfirmed())
            .evidenceDocumentId(entity.getEvidenceDocument() != null ? entity.getEvidenceDocument().getId() : null)
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
