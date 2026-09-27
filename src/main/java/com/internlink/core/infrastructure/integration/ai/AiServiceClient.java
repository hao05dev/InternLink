package com.internlink.core.infrastructure.integration.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class AiServiceClient {

    private final WebClient webClient;

    public AiServiceClient(
        WebClient.Builder webClientBuilder,
        @Value("${internlink.ai-service.base-url:http://localhost:8001}") String aiServiceUrl
    ) {
        this.webClient = webClientBuilder
            .baseUrl(aiServiceUrl)
            .build();
    }

    /**
     * Gọi sang Python AI Service để trích xuất và chuẩn hóa kỹ năng từ văn bản CV
     */
    public Map<String, Object> extractSkills(String cvRawText) {
        try {
            Map<String, Object> requestBody = Map.of(
                "text", cvRawText != null ? cvRawText : ""
            );

            return webClient.post()
                .uri("/api/v1/skills/extract")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(10))
                .blockOptional()
                .orElse(Map.of("normalized_skills", List.of(), "status", "EMPTY_RESPONSE"));
        } catch (Exception ex) {
            log.error("Lỗi khi gọi AI Service trích xuất kỹ năng: {}", ex.getMessage());
            // Fallback trả về danh sách rỗng nếu AI Service tạm thời offline
            return Map.of("normalized_skills", List.of(), "model", "fallback", "status", "FAILED");
        }
    }

    /**
     * Gọi sang Python AI Service để tính Match Score và Skill Gap với đầy đủ ngữ cảnh:
     * - Tiêu đề công việc và mô tả công việc (phục vụ tính tương đồng ngữ nghĩa semantic matching)
     * - Phân loại rõ ràng kỹ năng bắt buộc (mandatory) và kỹ năng mong muốn (optional)
     */
    public Map<String, Object> calculateMatchScore(
        UUID studentId,
        UUID jobId,
        String jobTitle,
        String jobDescription,
        String studentBio,
        List<String> studentSkills,
        List<String> mandatorySkillIds,
        List<String> optionalSkillIds
    ) {
        try {
            Map<String, Object> jobPayload = new HashMap<>();
            jobPayload.put("id", jobId.toString());
            jobPayload.put("title", jobTitle != null ? jobTitle : "");
            jobPayload.put("description", jobDescription != null ? jobDescription : "");
            jobPayload.put("mandatory_skill_ids", mandatorySkillIds != null ? mandatorySkillIds : List.of());
            jobPayload.put("optional_skill_ids", optionalSkillIds != null ? optionalSkillIds : List.of());

            Map<String, Object> studentPayload = new HashMap<>();
            studentPayload.put("id", studentId.toString());
            studentPayload.put("skill_ids", studentSkills != null ? studentSkills : List.of());
            studentPayload.put("bio_summary", studentBio != null ? studentBio : "");
            Map<String, Object> requestBody = Map.of("student", studentPayload, "jobs", List.of(jobPayload));

            Map<String, Object> response = webClient.post()
                .uri("/api/v1/matching/rank-jobs")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(10))
                .blockOptional()
                .orElse(Map.of("rankings", List.of()));

            Object rankings = response.get("rankings");
            if (rankings instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> first) {
                return normalizeRankingResponse(first);
            }

            return fallbackMatchScore(studentSkills, mandatorySkillIds, optionalSkillIds);
        } catch (Exception ex) {
            log.error("Lỗi khi gọi AI Service tính toán độ phù hợp: {}", ex.getMessage());
            // Fallback tính toán cơ bản theo quy tắc
            return fallbackMatchScore(studentSkills, mandatorySkillIds, optionalSkillIds);
        }
    }

    /** Overload giữ tương thích ngược */
    public Map<String, Object> calculateMatchScore(
        UUID studentId,
        UUID jobId,
        List<String> studentSkills,
        List<String> jobSkills
    ) {
        return calculateMatchScore(studentId, jobId, "", "", "", studentSkills, jobSkills, List.of());
    }

    private Map<String, Object> normalizeRankingResponse(Map<?, ?> ranking) {
        Object score = ranking.get("match_percentage");
        if (score == null) {
            score = ranking.get("match_score");
        }

        return Map.of(
            "match_score", score != null ? score : 0.0,
            "matched_skills", getOrDefault(ranking, "matched_skills", List.of()),
            "missing_skills", getOrDefault(ranking, "missing_skills", List.of()),
            "explanation", Map.of(
                "final_score", getOrDefault(ranking, "final_score", 0.0),
                "skill_score", getOrDefault(ranking, "skill_score", 0.0),
                "semantic_score", getOrDefault(ranking, "semantic_score", 0.0),
                "academic_score", getOrDefault(ranking, "academic_score", 0.0),
                "recommendation", getOrDefault(ranking, "recommendation", "")
            )
        );
    }

    private Object getOrDefault(Map<?, ?> map, String key, Object defaultValue) {
        Object value = map.get(key);
        return value != null ? value : defaultValue;
    }

    private Map<String, Object> fallbackMatchScore(
        List<String> studentSkills,
        List<String> mandatorySkillIds,
        List<String> optionalSkillIds
    ) {
        List<String> safeStudent = studentSkills != null ? studentSkills : List.of();
        List<String> safeMandatory = mandatorySkillIds != null ? mandatorySkillIds : List.of();
        List<String> safeOptional = optionalSkillIds != null ? optionalSkillIds : List.of();

        long mandatoryMatches = safeStudent.stream().filter(safeMandatory::contains).count();
        long optionalMatches = safeStudent.stream().filter(safeOptional::contains).count();

        double mandatoryRatio = safeMandatory.isEmpty() ? 0.0 : (double) mandatoryMatches / safeMandatory.size();
        double optionalRatio = safeOptional.isEmpty() ? 0.0 : (double) optionalMatches / safeOptional.size();
        double finalScore = safeMandatory.isEmpty()
            ? optionalRatio * 100.0
            : safeOptional.isEmpty() ? mandatoryRatio * 100.0
            : (mandatoryRatio * 0.7 + optionalRatio * 0.3) * 100.0;

        List<String> matched = new ArrayList<>();
        safeStudent.stream().filter(s -> safeMandatory.contains(s) || safeOptional.contains(s)).forEach(matched::add);

        List<String> missing = new ArrayList<>();
        safeMandatory.stream().filter(s -> !safeStudent.contains(s)).forEach(missing::add);

        return Map.of(
            "match_score", finalScore,
            "matched_skills", matched,
            "missing_skills", missing,
            "explanation", Map.of(
                "note", "Fallback Rule-Based Calculator (Mandatory 70% + Optional 30%)",
                "mandatory_coverage", mandatoryRatio,
                "optional_coverage", optionalRatio
            )
        );
    }
}
