package com.internlink.core.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

@Component
public class AiServiceClient {
    private final WebClient webClient;

    public AiServiceClient(@Value("${internlink.ai-service.base-url:http://localhost:8001}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Map<String, Object> extractSkills(String text) {
        try {
            return webClient.post()
                    .uri("/api/v1/skills/extract")
                    .bodyValue(Map.of("text", text))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    public Map<String, Object> rankJobsForStudent(Map<String, Object> payload) {
        try {
            return webClient.post()
                    .uri("/api/v1/matching/rank-jobs")
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    public Map<String, Object> getEmbedding(String text) {
        try {
            return webClient.post()
                    .uri("/api/v1/matching/embedding")
                    .bodyValue(Map.of("text", text))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }
}
