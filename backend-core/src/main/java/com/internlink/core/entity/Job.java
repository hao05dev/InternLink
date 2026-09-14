package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    public enum JobStatus {
        DRAFT,
        PENDING_APPROVAL,
        APPROVED,
        REJECTED,
        CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_major", length = 100)
    private String targetMajor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address addressEntity;

    @Column(name = "location_raw", length = 150)
    private String location;

    @Builder.Default
    @Column(name = "work_format", length = 30)
    private String workFormat = "ONSITE";

    @Builder.Default
    @Column(name = "slots")
    private Integer slots = 1;

    @Builder.Default
    @Column(name = "filled_slots")
    private Integer filledSlots = 0;

    @Column(name = "stipend_range", length = 100)
    private String stipendRange;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "expected_learning_outcomes", columnDefinition = "TEXT")
    private String expectedLearningOutcomes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", length = 30)
    private JobStatus status = JobStatus.DRAFT;

    @Column(name = "faculty_feedback", columnDefinition = "TEXT")
    private String facultyFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Builder.Default
    @Column(name = "version")
    private Integer version = 1;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "job_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> mandatorySkills = new HashSet<>();

    @Transient
    @Builder.Default
    private Set<Skill> optionalSkills = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
