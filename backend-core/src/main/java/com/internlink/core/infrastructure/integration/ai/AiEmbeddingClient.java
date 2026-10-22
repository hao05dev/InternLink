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
import java.util.Optional;

@Slf4j
@Component
public class AiEmbeddingClient {
    private final WebClient webClient;
    private final String serviceApiKey;

    public AiEmbeddingClient(
            WebClient.Builder builder,
            @Value("${internlink.ai-service.base-url:http://localhost:8001}") String url,
            @Value("${internlink.ai-service.api-key:}") String apiKey) {
        this.webClient = builder.baseUrl(url)
            .codecs(config -> config.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
        this.serviceApiKey = apiKey;
    }

    public Optional<AiEmbeddingInfo> info() {
        try {
            Map<String, Object> body = webClient.get().uri("/api/v1/matching/embedding/info")
                .header("X-InternLink-AI-Key", serviceApiKey)
                .retrieve().bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(5)).block();
            if (body == null || !Boolean.TRUE.equals(body.get("enabled"))) return Optional.empty();
            return Optional.of(new AiEmbeddingInfo(
                true, text(body, "model"), text(body, "model_revision"),
                number(body, "dimension").intValue(), text(body, "chunk_policy")));
        } catch (Exception ex) {
            log.warn("Embedding metadata unavailable: {}", ex.getClass().getSimpleName());
            return Optional.empty();
        }
    }

    public List<AiEmbeddingResult> embedBatch(List<AiEmbeddingInput> inputs) {
        if (inputs.isEmpty()) return List.of();
        List<Map<String, Object>> items = inputs.stream().map(input -> Map.<String, Object>of(
            "id", input.id(), "text", input.text(), "task", input.task())).toList();
        try {
            Map<String, Object> body = webClient.post().uri("/api/v1/matching/embedding/batch")
                .header("X-InternLink-AI-Key", serviceApiKey)
                .bodyValue(Map.of("items", items)).retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(Duration.ofSeconds(30)).block();
            if (body == null || !(body.get("results") instanceof List<?> rows)) return List.of();
            List<AiEmbeddingResult> results = new ArrayList<>();
            for (Object row : rows) if (row instanceof Map<?, ?> map) results.add(toResult(map));
            return results;
        } catch (Exception ex) {
            log.warn("Embedding batch unavailable: {}", ex.getClass().getSimpleName());
            return List.of();
        }
    }

    private AiEmbeddingResult toResult(Map<?, ?> row) {
        List<Double> vector = row.get("embedding") instanceof List<?> values
            ? values.stream().filter(Number.class::isInstance).map(Number.class::cast)
                .map(Number::doubleValue).toList()
            : List.of();
        Map<String, Object> normalized = new HashMap<>();
        row.forEach((key, value) -> normalized.put(String.valueOf(key), value));
        return new AiEmbeddingResult(
            text(normalized, "id"), vector, text(normalized, "model"),
            text(normalized, "model_revision"), number(normalized, "dimension").intValue(),
            text(normalized, "task"), text(normalized, "source_hash"),
            text(normalized, "chunk_policy"));
    }

    private static String text(Map<String, Object> map, String key) {
        return map.get(key) == null ? "" : map.get(key).toString();
    }

    private static Number number(Map<String, Object> map, String key) {
        return map.get(key) instanceof Number number ? number : 0;
    }
}
