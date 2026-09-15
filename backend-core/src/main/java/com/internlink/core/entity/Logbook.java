package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "logbooks", uniqueConstraints = {
        @UniqueConstraint(name = "uq_logbook_week", columnNames = { "learning_agreement_id", "week_number" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Logbook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "learning_agreement_id", nullable = false)
    private Long learningAgreementId;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "tasks_performed", columnDefinition = "TEXT", nullable = false)
    private String tasksPerformed;

    @Column(name = "learned_skills", columnDefinition = "TEXT")
    private String learnedSkills;

    @Column(name = "evidence_url", columnDefinition = "TEXT")
    private String evidenceUrl; // Link Git PR / Drive

    @Builder.Default
    @Column(name = "hours_logged")
    private Double hoursLogged = 0.0;

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "SUBMITTED"; // SUBMITTED, APPROVED, REJECTED, REVISION_REQUESTED

    @Column(name = "mentor_feedback", columnDefinition = "TEXT")
    private String mentorFeedback;

    @Column(name = "mentor_rating")
    private Integer mentorRating; // 1 đến 5 sao

    @Column(name = "supervisor_notes", columnDefinition = "TEXT")
    private String supervisorNotes;

    @Column(name = "supervisor_reviewed_at")
    private LocalDateTime supervisorReviewedAt;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}