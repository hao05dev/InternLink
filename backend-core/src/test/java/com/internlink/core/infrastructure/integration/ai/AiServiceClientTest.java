package com.internlink.core.infrastructure.integration.ai;

import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AiServiceClientTest {

    @Test
    void calculateMatchScoreFallsBackToRuleBasedScoringWhenAiServiceIsUnavailable() {
        AiServiceClient client = new AiServiceClient(WebClient.builder(), "http://127.0.0.1:1");

        Map<String, Object> result = client.calculateMatchScore(
            UUID.randomUUID(),
            UUID.randomUUID(),
            List.of("java", "spring", "postgres"),
            List.of("java", "docker")
        );

        assertThat(result.get("match_score")).isEqualTo(50.0);
        assertThat(stringList(result.get("matched_skills"))).containsExactly("java");
        assertThat(stringList(result.get("missing_skills"))).containsExactly("docker");
        assertThat(objectMap(result.get("explanation")))
            .containsEntry("note", "Fallback Rule-Based Calculator");
    }

    @Test
    void extractSkillsFromCvFallsBackToEmptyNormalizedSkillsWhenAiServiceIsUnavailable() {
        AiServiceClient client = new AiServiceClient(WebClient.builder(), "http://127.0.0.1:1");

        Map<String, Object> result = client.extractSkillsFromCv(UUID.randomUUID(), "Java Spring Boot");

        assertThat(result.get("normalized_skills")).isEqualTo(List.of());
        assertThat(result).containsEntry("status", "FAILED");
    }

    @SuppressWarnings("unchecked")
    private List<String> stringList(Object value) {
        return (List<String>) value;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> objectMap(Object value) {
        return (Map<String, Object>) value;
    }
}
