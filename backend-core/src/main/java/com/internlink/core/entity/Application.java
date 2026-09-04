package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private LocalDateTime interviewTime;
    private String interviewLocation;
    private String feedback;

    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();

    public enum ApplicationStatus {
        APPLIED,
        REVIEWING,
        INTERVIEW_SCHEDULED,
        OFFERED,
        OFFER_ACCEPTED,
        REJECTED,
        WITHDRAWN
    }
}
