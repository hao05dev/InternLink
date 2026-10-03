package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AiMatchScoringHandler {
    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaJobSkillRepository jobSkillRepository;
    private final JpaStudentSkillRepository studentSkillRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final AiServiceClient aiServiceClient;
    private final AiMatchingMapper mapper;

    public AiMatchScoreResponse calculateMatchScoreForJob(UUID studentId, UUID jobId) {
        JobPosition job = jobPositionRepository.findById(jobId)
            .filter(j -> j.getStatus() == JobStatus.APPROVED)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", jobId));
        List<JobSkill> requirements = jobSkillRepository.findByIdJobId(jobId);
        Map<String, Object> result = aiServiceClient.calculateMatchScore(studentId, jobId,
            job.getTitle(), job.getDescription(), bio(studentId), skills(studentId),
            ids(requirements, RequirementType.MANDATORY), ids(requirements, RequirementType.OPTIONAL));
        return response(job, result);
    }

    public List<AiMatchScoreResponse> recommendJobsForStudent(UUID studentId, UUID termId) {
        List<JobPosition> jobs = jobPositionRepository.findByTermIdAndStatus(termId, JobStatus.APPROVED);
        if (jobs.isEmpty()) return List.of();
        Map<UUID, List<JobSkill>> requirements = jobSkillRepository.findByIdJobIdIn(
            jobs.stream().map(JobPosition::getId).toList()).stream()
            .collect(Collectors.groupingBy(skill -> skill.getId().getJobId()));
        Map<String, Object> student = Map.of("id", studentId.toString(),
            "skill_ids", skills(studentId), "bio_summary", bio(studentId));
        List<AiMatchScoreResponse> responses = new ArrayList<>();
        // Bound each inference batch to the Python contract and keep all jobs.
        for (int offset = 0; offset < jobs.size(); offset += 100) {
            List<JobPosition> batch = jobs.subList(offset, Math.min(offset + 100, jobs.size()));
            List<Map<String, Object>> payload = batch.stream().map(job -> {
                List<JobSkill> req = requirements.getOrDefault(job.getId(), List.of());
                return Map.<String, Object>of("id", job.getId().toString(), "title", job.getTitle(),
                    "mandatory_skill_ids", ids(req, RequirementType.MANDATORY),
                    "optional_skill_ids", ids(req, RequirementType.OPTIONAL));
            }).toList();
            Map<String, Map<String, Object>> results = aiServiceClient.rankJobs(student, payload).stream()
                .collect(Collectors.toMap(row -> String.valueOf(row.get("job_id")), row -> row));
            for (JobPosition job : batch) {
                Map<String, Object> result = results.get(job.getId().toString());
                if (result != null) responses.add(response(job, result));
            }
        }
        responses.sort(Comparator.comparing(AiMatchScoreResponse::getScoreAvailable).reversed()
            .thenComparing(AiMatchScoreResponse::getMatchScore, Comparator.reverseOrder())
            .thenComparing(row -> row.getJobId().toString()));
        return responses;
    }

    private List<String> skills(UUID id) {
        return studentSkillRepository.findByIdStudentIdAndIsConfirmedTrue(id).stream()
            .map(skill -> skill.getSkill().getId()).distinct().toList();
    }

    private String bio(UUID id) {
        return studentProfileRepository.findByUserId(id).map(profile -> profile.getBio()).orElse("");
    }

    private List<String> ids(List<JobSkill> rows, RequirementType type) {
        return rows.stream().filter(row -> row.getRequirementType() == type)
            .map(row -> row.getSkill().getId()).distinct().toList();
    }

    private AiMatchScoreResponse response(JobPosition job, Map<String, Object> result) {
        return AiMatchScoreResponse.builder().jobId(job.getId()).jobTitle(job.getTitle())
            .companyName(job.getCompany().getCompanyName()).matchScore(mapper.extractScore(result))
            .matchedSkills(mapper.extractStringList(result.get("matched_skills")))
            .missingSkills(mapper.extractStringList(result.get("missing_skills")))
            .explanation(mapper.extractMap(result.get("explanation")))
            .mode(String.valueOf(result.getOrDefault("mode", "unknown")))
            .scoreAvailable(Boolean.TRUE.equals(result.get("score_available")))
            .semanticAvailable(Boolean.TRUE.equals(result.get("semantic_available")))
            .algorithmVersion(String.valueOf(result.getOrDefault("algorithm_version", "unknown")))
            .warnings(mapper.extractStringList(result.get("warnings"))).build();
    }
}
