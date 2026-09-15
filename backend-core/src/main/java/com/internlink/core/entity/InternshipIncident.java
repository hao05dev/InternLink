package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "internship_incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "learning_agreement_id", nullable = false)
    private Long learningAgreementId;

    @Column(name = "reported_by_user_id", nullable = false)
    private Long reportedByUserId;

    @Column(name = "incident_type", length = 50, nullable = false)
    private String incidentType; // TASK_MISMATCH, WORK_ENVIRONMENT, UNPAID_STIPEND, CONFIDENTIALITY_BREACH

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "student_evidence_url", columnDefinition = "TEXT")
    private String studentEvidenceUrl;

    @Builder.Default
    @Column(name = "severity", length = 20)
    private String severity = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Builder.Default
    @Column(name = "resolution_status", length = 30)
    private String resolutionStatus = "OPEN"; // OPEN, IN_REVIEW, RESOLVED, CLOSED

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolved_by_user_id")
    private Long resolvedByUserId;

    @CreationTimestamp
    @Column(name = "reported_at", updatable = false)
    private LocalDateTime reportedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}