package com.internlink.core.infrastructure.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.domain.ai_matching.EmbeddingCacheEntry;
import com.internlink.core.infrastructure.integration.ai.AiEmbeddingInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EmbeddingCacheRepository {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public Optional<EmbeddingCacheEntry> find(
            String subjectType, UUID subjectId, String sourceHash, String task, AiEmbeddingInfo info) {
        String sql = """
            SELECT source_version, embedding::text
            FROM embedding_records
            WHERE subject_type = ? AND subject_id = ? AND source_hash = ? AND task = ?
              AND model = ? AND model_revision = ? AND dimension = ? AND chunk_policy = ?
            """;
        return jdbcTemplate.query(sql, (rs, row) -> new EmbeddingCacheEntry(
            subjectType, subjectId, sourceHash, rs.getString("source_version"), task,
            info.model(), info.modelRevision(), info.dimension(), info.chunkPolicy(),
            readVector(rs.getString("embedding"))),
            subjectType, subjectId, sourceHash, task, info.model(), info.modelRevision(),
            info.dimension(), info.chunkPolicy()).stream().findFirst();
    }

    public void save(EmbeddingCacheEntry entry) {
        String sql = """
            INSERT INTO embedding_records
                (subject_type, subject_id, source_hash, source_version, task, model,
                 model_revision, dimension, chunk_policy, embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS vector))
            ON CONFLICT (subject_type, subject_id, source_hash, task, model,
                         model_revision, dimension, chunk_policy)
            DO UPDATE SET source_version = EXCLUDED.source_version,
                          embedding = EXCLUDED.embedding, created_at = NOW()
            """;
        jdbcTemplate.update(sql, entry.subjectType(), entry.subjectId(), entry.sourceHash(),
            entry.sourceVersion(), entry.task(), entry.model(), entry.modelRevision(),
            entry.dimension(), entry.chunkPolicy(), vectorLiteral(entry.embedding()));
    }

    private List<Double> readVector(String raw) {
        try {
            return objectMapper.readValue(raw, new TypeReference<>() {});
        } catch (Exception ex) {
            throw new IllegalStateException("Stored embedding is invalid", ex);
        }
    }

    private String vectorLiteral(List<Double> vector) {
        return vector.toString().replace(" ", "");
    }
}
