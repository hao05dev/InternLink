package com.internlink.core.application.ai_matching;

import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.SkillTaxonomyResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;

import java.util.List;
import java.util.UUID;

public interface AiMatchingService {
    List<SkillTaxonomyResponse> getAllTaxonomySkills();
    List<StudentSkillResponse> getSkillsByStudent(UUID studentId);
    List<StudentSkillResponse> syncCvSkills(UUID studentId, UUID documentId, String cvText);
    UUID reprocessFailedCvRun(UUID runId, String cvText);
    StudentSkillResponse confirmStudentSkill(UUID studentId, String skillId, Boolean confirmed);
    AiMatchScoreResponse calculateMatchScoreForJob(UUID studentId, UUID jobId);
    List<AiMatchScoreResponse> recommendJobsForStudent(UUID studentId, UUID termId);
}
