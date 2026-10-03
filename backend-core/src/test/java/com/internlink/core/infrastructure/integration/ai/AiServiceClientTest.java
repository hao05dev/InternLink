package com.internlink.core.infrastructure.integration.ai;

import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class AiServiceClientTest {

    @Test
    void extractSkillsUsesThePythonServiceContract() throws Exception {
        AtomicReference<String> path = new AtomicReference<>();
        AtomicReference<String> request = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            path.set(exchange.getRequestURI().getPath());
            request.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] response = "{\"normalized_skills\":[{\"id\":\"SK-JAVA\"}]}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            try (var output = exchange.getResponseBody()) {
                output.write(response);
            }
        });
        server.start();
        try {
            AiServiceClient client = new AiServiceClient(WebClient.builder(),
                "http://127.0.0.1:" + server.getAddress().getPort());
            Map<String, Object> result = client.extractSkills("Java Spring Boot");

            assertThat(path.get()).isEqualTo("/api/v1/skills/extract");
            assertThat(request.get()).contains("\"text\":\"Java Spring Boot\"");
            assertThat(result.get("normalized_skills")).isInstanceOf(List.class);
        } finally {
            server.stop(0);
        }
    }

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
            .containsEntry("note", "Fallback Rule-Based Calculator (Mandatory 80% + Optional 20%)");
    }

    @Test
    void extractSkillsFromCvFallsBackToEmptyNormalizedSkillsWhenAiServiceIsUnavailable() {
        AiServiceClient client = new AiServiceClient(WebClient.builder(), "http://127.0.0.1:1");

        Map<String, Object> result = client.extractSkills("Java Spring Boot");

        assertThat(result.get("normalized_skills")).isEqualTo(List.of());
        assertThat(result).containsEntry("status", "FAILED");
    }

    @Test
    void fallbackMatchesSharedPythonContract() throws Exception {
        var json = new com.fasterxml.jackson.databind.ObjectMapper();
        var cases = json.readTree(java.nio.file.Path.of("../ai-service/tests/fixtures/ranking_contract.json").toFile());
        var client = new AiServiceClient(WebClient.builder(), "http://127.0.0.1:1");
        for (var sample : cases) {
            List<String> student = json.convertValue(sample.get("student"), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
            List<String> mandatory = json.convertValue(sample.get("mandatory"), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
            List<String> optional = json.convertValue(sample.get("optional"), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
            var result = client.fallbackMatchScore(student, mandatory, optional);
            assertThat(((Number) result.get("match_score")).doubleValue()).isEqualTo(sample.get("percentage").asDouble());
            assertThat(result.get("score_available")).isEqualTo(sample.get("available").asBoolean());
            assertThat(result.get("semantic_available")).isEqualTo(false);
        }
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
