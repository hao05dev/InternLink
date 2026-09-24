package com.internlink.core.infrastructure.integration.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
public class AiServiceClient {

    private final WebClient webClient;

    public AiServiceClient(
        WebClient.Builder webClientBuilder,
        @Value("${internlink.ai-service.base-url:http://localhost:8001}") String baseUrl
    ) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    /**
     * Gọi sang Python AI Service để trích xuất kỹ năng từ văn bản CV
     */
    public Map<String, Object> extractSkillsFromCv(UUID studentId, String cvText) {
        try {
            Map<String, Object> requestBody = Map.of(
                "text", cvText != null ? cvText : ""
            );

            return webClient.post()
                .uri("/api/v1/skills/extract")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .blockOptional()
                .orElse(Map.of("normalized_skills", List.of(), "status", "EMPTY_RESPONSE"));
        } catch (Exception ex) {
            log.error("Lỗi khi gọi AI Service trích xuất kỹ năng: {}", ex.getMessage());
            // Fallback trả về danh sách rỗng nếu AI Service tạm thời offline
            return Map.of("normalized_skills", List.of(), "model", "fallback", "status", "FAILED");
        }
    }

    /**
     * Gọi sang Python AI Service để tính Match Score và Skill Gap giữa SV và Job
     */
    public Map<String, Object> calculateMatchScore(
        UUID studentId,
        UUID jobId,
        List<String> studentSkills,
        List<String> jobSkills
    ) {
        try {
            Map<String, Object> requestBody = Map.of(
                "student", Map.of(
                    "id", studentId.toString(),
                    "skill_ids", studentSkills
                ),
                "jobs", List.of(Map.of(
                    "id", jobId.toString(),
                    "title", "",
                    "mandatory_skill_ids", jobSkills,
                    "optional_skill_ids", List.of()
                ))
            );

            Map<String, Object> response = webClient.post()
                .uri("/api/v1/matching/rank-jobs")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .blockOptional()
                .orElse(Map.of("rankings", List.of()));

            Object rankings = response.get("rankings");
            if (rankings instanceof List<?> list && !list.isEmpty() && list.get(0) instanceof Map<?, ?> first) {
                return normalizeRankingResponse(first);
            }

            return fallbackMatchScore(studentSkills, jobSkills);
        } catch (Exception ex) {
            log.error("Lỗi khi gọi AI Service tính toán độ phù hợp: {}", ex.getMessage());
            // Fallback tính toán cơ bản theo tập hợp Jaccard tương đồng
            return fallbackMatchScore(studentSkills, jobSkills);
        }
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

    private Map<String, Object> fallbackMatchScore(List<String> studentSkills, List<String> jobSkills) {
        long matchCount = studentSkills.stream().filter(jobSkills::contains).count();
        double score = jobSkills.isEmpty() ? 0.0 : (double) matchCount / jobSkills.size() * 100.0;
        return Map.of(
            "match_score", score,
            "matched_skills", studentSkills.stream().filter(jobSkills::contains).toList(),
            "missing_skills", jobSkills.stream().filter(s -> !studentSkills.contains(s)).toList(),
            "explanation", Map.of("note", "Fallback Rule-Based Calculator")
        );
    }
}
