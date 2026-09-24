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
                "student_id", studentId.toString(),
                "cv_text", cvText
            );

            return webClient.post()
                .uri("/api/v1/extract-skills")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
        } catch (Exception ex) {
            log.error("Lỗi khi gọi AI Service trích xuất kỹ năng: {}", ex.getMessage());
            // Fallback trả về danh sách rỗng nếu AI Service tạm thời offline
            return Map.of("skills", List.of(), "model", "fallback", "status", "FAILED");
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
                "student_id", studentId.toString(),
                "job_id", jobId.toString(),
                "student_skills", studentSkills,
                "job_skills", jobSkills
            );

            return webClient.post()
                .uri("/api/v1/match")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();
        } catch (Exception ex) {
            log.error("Lỗi khi gọi AI Service tính toán độ phù hợp: {}", ex.getMessage());
            // Fallback tính toán cơ bản theo tập hợp Jaccard tương đồng
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
}
