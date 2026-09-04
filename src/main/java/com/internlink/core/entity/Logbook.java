package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "logbooks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Logbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_agreement_id", nullable = false)
    private LearningAgreement learningAgreement;

    private Integer weekNumber;
    private LocalDate logDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String tasksPerformed;

    private String evidenceUrl; // Link GitHub PR, báo cáo, tài liệu minh chứng
    private Double hoursSpent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LogbookStatus status = LogbookStatus.SUBMITTED;

    @Column(columnDefinition = "TEXT")
    private String mentorFeedback;

    @Column(columnDefinition = "TEXT")
    private String supervisorFeedback;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum LogbookStatus {
        SUBMITTED,
        APPROVED_BY_MENTOR,
        REVISION_REQUESTED
    }
}
