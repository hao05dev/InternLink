package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "internship_appeals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipAppeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "learning_agreement_id", nullable = false)
    private Long learningAgreementId;

    @Column(name = "student_user_id", nullable = false)
    private Long studentUserId;

    @Column(name = "appeal_type", length = 50, nullable = false)
    private String appealType; // EVALUATION_SCORE, LOGBOOK_FEEDBACK, GENERAL

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "evidence_url", columnDefinition = "TEXT")
    private String evidenceUrl;

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "PENDING"; // PENDING, IN_REVIEW, RESOLVED, REJECTED

    @Column(name = "response_content", columnDefinition = "TEXT")
    private String responseContent;

    @Column(name = "handled_by_user_id")
    private Long handledByUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
