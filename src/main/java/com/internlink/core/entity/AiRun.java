package com.internlink.core.entity;

import com.internlink.core.common.enums.AiRunStatus;
import com.internlink.core.common.enums.AiRunType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ai_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "run_type", nullable = false, length = 30)
    private AiRunType runType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_document_id")
    private Document sourceDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private JobPosition job;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private AiRunStatus status = AiRunStatus.PENDING;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "model_version", length = 100)
    private String modelVersion;

    @Column(name = "taxonomy_version", length = 50)
    private String taxonomyVersion;

    @Column(name = "input_hash", nullable = false, length = 128)
    private String inputHash;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "input_snapshot", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> inputSnapshot = Map.of();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_result", columnDefinition = "jsonb")
    private Map<String, Object> outputResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "error_detail", columnDefinition = "jsonb")
    private Map<String, Object> errorDetail;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
