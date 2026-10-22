package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.ai_matching.EmbeddingCacheEntry;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingClient;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingInfo;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingInput;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingResult;
import com.internlink.core.infrastructure.persistence.EmbeddingCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmbeddingPreparationService {
    private final EmbeddingCacheRepository cache;
    private final AiEmbeddingClient client;

    public Map<String, AiEmbeddingResult> prepare(List<EmbeddingDocument> documents) {
        AiEmbeddingInfo info = client.info().orElse(null);
        if (info == null || !validInfo(info)) return Map.of();

        Map<String, AiEmbeddingResult> prepared = new HashMap<>();
        List<EmbeddingDocument> missing = new ArrayList<>();
        Map<String, String> hashes = new HashMap<>();
        for (EmbeddingDocument document : documents) {
            if (document.text() == null || document.text().isBlank()) continue;
            String hash = sha256(document.text());
            hashes.put(document.id(), hash);
            cached(document, hash, info).ifPresentOrElse(
                entry -> prepared.put(document.id(), result(document.id(), entry)),
                () -> missing.add(document));
        }

        List<AiEmbeddingInput> inputs = missing.stream()
            .map(document -> new AiEmbeddingInput(document.id(), document.text(), document.task()))
            .toList();
        for (AiEmbeddingResult result : client.embedBatch(inputs)) {
            EmbeddingDocument document = missing.stream()
                .filter(item -> item.id().equals(result.id())).findFirst().orElse(null);
            if (document == null || !validResult(result, hashes.get(document.id()), info)) continue;
            prepared.put(document.id(), result);
            save(document, result);
        }
        return prepared;
    }

    private java.util.Optional<EmbeddingCacheEntry> cached(
            EmbeddingDocument document, String hash, AiEmbeddingInfo info) {
        try {
            return cache.find(document.subjectType(), document.subjectId(), hash, document.task(), info);
        } catch (RuntimeException ex) {
            log.warn("Embedding cache read failed: {}", ex.getClass().getSimpleName());
            return java.util.Optional.empty();
        }
    }

    private void save(EmbeddingDocument document, AiEmbeddingResult result) {
        try {
            cache.save(new EmbeddingCacheEntry(
                document.subjectType(), document.subjectId(), result.sourceHash(),
                document.sourceVersion(), result.task(), result.model(), result.modelRevision(),
                result.dimension(), result.chunkPolicy(), result.embedding()));
        } catch (RuntimeException ex) {
            log.warn("Embedding cache write failed: {}", ex.getClass().getSimpleName());
        }
    }

    private boolean validInfo(AiEmbeddingInfo info) {
        return info.dimension() > 0 && !info.model().isBlank()
            && !info.modelRevision().isBlank() && !info.chunkPolicy().isBlank();
    }

    private boolean validResult(AiEmbeddingResult result, String hash, AiEmbeddingInfo info) {
        return hash != null && hash.equals(result.sourceHash())
            && info.model().equals(result.model())
            && info.modelRevision().equals(result.modelRevision())
            && info.dimension() == result.dimension()
            && info.chunkPolicy().equals(result.chunkPolicy())
            && result.embedding().size() == info.dimension();
    }

    private AiEmbeddingResult result(String id, EmbeddingCacheEntry entry) {
        return new AiEmbeddingResult(
            id, entry.embedding(), entry.model(), entry.modelRevision(), entry.dimension(),
            entry.task(), entry.sourceHash(), entry.chunkPolicy());
    }

    private String sha256(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(text.strip().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }
}
