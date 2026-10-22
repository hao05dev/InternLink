package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.domain.ai_matching.EmbeddingCacheEntry;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingClient;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingInfo;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingResult;
import com.internlink.core.infrastructure.persistence.EmbeddingCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmbeddingPreparationServiceTest {
    @Mock private EmbeddingCacheRepository cache;
    @Mock private AiEmbeddingClient client;

    private EmbeddingPreparationService service;
    private AiEmbeddingInfo info;

    @BeforeEach
    void setUp() {
        service = new EmbeddingPreparationService(cache, client);
        info = new AiEmbeddingInfo(true, "e5", "r1", 2, "chunks-v1");
        when(client.info()).thenReturn(Optional.of(info));
    }

    @Test
    void cacheHitDoesNotCallEmbeddingProvider() {
        UUID subjectId = UUID.randomUUID();
        EmbeddingDocument document = document(subjectId);
        when(cache.find(eq("STUDENT_PROFILE"), eq(subjectId), any(), eq("retrieval_query"), eq(info)))
            .thenReturn(Optional.of(new EmbeddingCacheEntry(
                "STUDENT_PROFILE", subjectId, hash("Java"), "3", "retrieval_query",
                "e5", "r1", 2, "chunks-v1", List.of(1.0, 0.0))));

        Map<String, AiEmbeddingResult> result = service.prepare(List.of(document));

        assertThat(result.get("student").embedding()).containsExactly(1.0, 0.0);
        verify(client, never()).embedBatch(any());
        verify(cache, never()).save(any());
    }

    @Test
    void cacheMissStoresOnlyMatchingProviderMetadata() {
        UUID subjectId = UUID.randomUUID();
        EmbeddingDocument document = document(subjectId);
        when(cache.find(any(), any(), any(), any(), any())).thenReturn(Optional.empty());
        when(client.embedBatch(any())).thenReturn(List.of(new AiEmbeddingResult(
            "student", List.of(1.0, 0.0), "e5", "r1", 2,
            "retrieval_query", hash("Java"), "chunks-v1")));

        Map<String, AiEmbeddingResult> result = service.prepare(List.of(document));

        assertThat(result).containsKey("student");
        verify(cache).save(argThat(entry -> entry.subjectId().equals(subjectId)
            && entry.sourceVersion().equals("3") && entry.sourceHash().equals(hash("Java"))));
    }

    @Test
    void mismatchedRevisionIsNotCachedOrReturned() {
        when(cache.find(any(), any(), any(), any(), any())).thenReturn(Optional.empty());
        when(client.embedBatch(any())).thenReturn(List.of(new AiEmbeddingResult(
            "student", List.of(1.0, 0.0), "e5", "old", 2,
            "retrieval_query", hash("Java"), "chunks-v1")));

        assertThat(service.prepare(List.of(document(UUID.randomUUID())))).isEmpty();
        verify(cache, never()).save(any());
    }

    private EmbeddingDocument document(UUID subjectId) {
        return new EmbeddingDocument(
            "student", "STUDENT_PROFILE", subjectId, "3", "retrieval_query", "Java");
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
