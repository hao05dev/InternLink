package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.application.ai_matching.AiMatchingService;
import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.domain.ai_matching.StudentSkillId;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.SkillTaxonomyResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.SkillSource;
import com.internlink.core.shared.exception.ResourceNotFoundException;
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
    private final AiServiceClient aiServiceClient;

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
        return studentSkillRepository.findByIdStudentId(studentId).stream()
            .map(this::mapStudentSkillToResponse)
            .toList();
    }

    @Override
    @Transactional
    public List<StudentSkillResponse> syncCvSkills(UUID studentId, UUID documentId, String cvText) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        // 1. Gọi sang AI Microservice để trích xuất kỹ năng
        Map<String, Object> aiResult = aiServiceClient.extractSkillsFromCv(studentId, cvText);

        // 2. Ghi nhật ký chạy AI (ai_runs)
        AiRun run = AiRun.builder()
            .runType(AiRunType.CV_EXTRACTION)
            .student(student)
            .status(AiRunStatus.COMPLETED)
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
            StudentSkill studentSkill = studentSkillRepository.findById(id)
                .orElse(StudentSkill.builder()
                    .id(id)
                    .student(student)
                    .skill(taxonomyOpt.get())
                    .source(SkillSource.CV_AI)
                    .build());

            Object conf = item.get("confidence");
            if (conf instanceof Number num) {
                studentSkill.setConfidence(BigDecimal.valueOf(num.doubleValue()));
            } else if (studentSkill.getConfidence() == null) {
                studentSkill.setConfidence(BigDecimal.ONE);
            }
            studentSkill.setIsConfirmed(true);

            skillsToSave.add(studentSkill);
        }

        List<StudentSkill> saved = studentSkillRepository.saveAll(skillsToSave);
        return saved.stream().map(this::mapStudentSkillToResponse).toList();
    }

    @Override
    @Transactional
    public StudentSkillResponse confirmStudentSkill(UUID studentId, String skillId, Boolean confirmed) {
        StudentSkillId id = new StudentSkillId(studentId, skillId);
        StudentSkill skill = studentSkillRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StudentSkill", "id", skillId));

        skill.setIsConfirmed(confirmed);
        return mapStudentSkillToResponse(studentSkillRepository.save(skill));
    }

    @Override
    @Transactional(readOnly = true)
    public AiMatchScoreResponse calculateMatchScoreForJob(UUID studentId, UUID jobId) {
        JobPosition job = jobPositionRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", jobId));

        // Lấy danh sách kỹ năng của sinh viên đã xác nhận
        List<String> studentSkills = studentSkillRepository.findByIdStudentIdAndIsConfirmedTrue(studentId)
            .stream().map(ss -> ss.getSkill().getId()).toList();

        // Lấy danh sách kỹ năng yêu cầu của Job
        List<String> jobSkills = jobSkillRepository.findByIdJobId(jobId)
            .stream().map(js -> js.getSkill().getId()).toList();

        // Gọi AI Service tính Match Score
        Map<String, Object> matchResult = aiServiceClient.calculateMatchScore(studentId, jobId, studentSkills, jobSkills);

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
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }

    private List<String> extractStringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        return list.stream()
            .filter(Objects::nonNull)
            .map(Object::toString)
            .toList();
    }

    private Map<String, Object> extractMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return Map.of();
        }

        Map<String, Object> result = new HashMap<>();
        map.forEach((key, mapValue) -> {
            if (key != null) {
                result.put(key.toString(), mapValue);
            }
        });
        return result;
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
            .studentId(entity.getStudent().getId())
            .skillId(entity.getSkill().getId())
            .skillName(entity.getSkill().getSkillName())
            .category(entity.getSkill().getCategory())
            .source(entity.getSource())
            .proficiencyLevel(entity.getProficiencyLevel())
            .confidence(entity.getConfidence())
            .isConfirmed(entity.getIsConfirmed())
            .evidenceDocumentId(entity.getEvidenceDocument() != null ? entity.getEvidenceDocument().getId() : null)
            .build();
    }
}
