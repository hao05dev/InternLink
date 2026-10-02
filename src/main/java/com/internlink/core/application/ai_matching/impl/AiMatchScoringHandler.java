package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobSkillRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentSkillRepository;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
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

        BigDecimal score = mapper.extractScore(matchResult);
        List<String> matched = mapper.extractStringList(matchResult.get("matched_skills"));
        List<String> missing = mapper.extractStringList(matchResult.get("missing_skills"));
        Map<String, Object> explanation = mapper.extractMap(matchResult.get("explanation"));

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
}
