package com.internlink.core.presentation.ai_matching.dto.response;

import com.internlink.core.shared.enums.AiRunStatus;
import com.internlink.core.shared.enums.AiRunType;
import com.internlink.core.shared.enums.SkillCategory;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class AdminAiResponse {
    private AdminAiResponse() {}

    public record Stats(long total, long completed, long failed, long pending, long running) {}
    public record Health(boolean available, boolean geminiConfigured, String extractionModel,
                         String embeddingModel, OffsetDateTime checkedAt) {}
    public record Run(UUID id, AiRunType runType, AiRunStatus status, UUID studentId,
                      String studentName, String studentEmail, UUID sourceDocumentId,
                      UUID jobId, String jobTitle, String modelName, String modelVersion,
                      String taxonomyVersion, OffsetDateTime createdAt, OffsetDateTime startedAt,
                      OffsetDateTime completedAt, boolean canRetry) {}
    public record Detail(Run run, Map<String, Object> inputSnapshot,
                         Map<String, Object> outputResult, Map<String, Object> errorDetail) {}
    public record RunPage(List<Run> content, long totalElements, int totalPages, int number) {}
    public record Taxonomy(String id, String skillName, SkillCategory category, String framework,
                           String description, List<String> aliases, String taxonomyVersion,
                           Boolean isActive, OffsetDateTime updatedAt) {}
}
