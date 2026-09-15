package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_agreements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "internship_term_id")
    private Long internshipTermId;

    @Column(name = "application_id", unique = true, nullable = false)
    private Long applicationId;

    @Column(name = "student_id", nullable = false)
    private Long studentId; // User ID của Sinh viên

    @Column(name = "academic_supervisor_id", nullable = false)
    private Long academicSupervisorId; // User ID của GVHD

    @Column(name = "company_mentor_id", nullable = false)
    private Long companyMentorId; // User ID của Mentor DN

    @Column(name = "educational_objectives", columnDefinition = "TEXT", nullable = false)
    private String educationalObjectives;

    @Column(name = "detailed_tasks", columnDefinition = "TEXT", nullable = false)
    private String detailedTasks;

    @Column(name = "knowledge_skills_to_acquire", columnDefinition = "TEXT")
    private String knowledgeSkillsToAcquire;

    @Builder.Default
    @Column(name = "confidentiality_agreed")
    private Boolean confidentialityAgreed = true;

    @Builder.Default
    @Column(name = "work_hours_per_week")
    private Integer workHoursPerWeek = 40;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Builder.Default
    @Column(name = "version")
    private Integer version = 1;

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "PENDING_SIGNATURES"; // DRAFT, PENDING_SIGNATURES, FULLY_SIGNED, IN_PROGRESS, COMPLETED

    @Builder.Default
    @Column(name = "student_signed")
    private Boolean studentSigned = false;

    @Column(name = "student_signed_at")
    private LocalDateTime studentSignedAt;

    @Builder.Default
    @Column(name = "mentor_signed")
    private Boolean mentorSigned = false;

    @Column(name = "mentor_signed_at")
    private LocalDateTime mentorSignedAt;

    @Builder.Default
    @Column(name = "supervisor_signed")
    private Boolean supervisorSigned = false;

    @Column(name = "supervisor_signed_at")
    private LocalDateTime supervisorSignedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}