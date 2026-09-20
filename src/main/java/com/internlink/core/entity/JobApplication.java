package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "job_applications", uniqueConstraints = {
    @UniqueConstraint(name = "uq_job_applications_job_student", columnNames = {"job_id", "student_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPosition job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_cv_document_id", nullable = false)
    private Document submittedCvDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matching_ai_run_id")
    private AiRun matchingAiRun;

    @Column(name = "cover_letter", columnDefinition = "text")
    private String coverLetter;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_match_detail", columnDefinition = "jsonb")
    private Map<String, Object> aiMatchDetail;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "interview_rounds", columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Object>> interviewRounds = List.of();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;
}
