package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = {
        @UniqueConstraint(name = "uq_application_student_job", columnNames = { "student_profile_id", "job_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_profile_id", nullable = false)
    private Long studentProfileId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "ai_match_score")
    private Double aiMatchScore;

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "APPLIED"; // APPLIED, REVIEWING, INTERVIEW_SCHEDULED, OFFERED, ACCEPTED, REJECTED

    @Column(name = "offer_details", columnDefinition = "TEXT")
    private String offerDetails;

    @Column(name = "offer_deadline")
    private LocalDateTime offerDeadline;

    @Column(name = "student_decision_at")
    private LocalDateTime studentDecisionAt;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}