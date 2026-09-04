package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_supervisor_id")
    private User academicSupervisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_mentor_id")
    private User companyMentor;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String learningObjectives; // Mục tiêu đào tạo

    @Column(columnDefinition = "TEXT", nullable = false)
    private String detailedTasks; // Nhiệm vụ công việc cụ thể

    private LocalDate startDate;
    private LocalDate endDate;

    @Builder.Default
    private Integer version = 1; // Hỗ trợ versioning theo chuẩn Erasmus+

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AgreementStatus status = AgreementStatus.DRAFT;

    private boolean studentSigned;
    private LocalDateTime studentSignedAt;

    private boolean mentorSigned;
    private LocalDateTime mentorSignedAt;

    private boolean supervisorSigned;
    private LocalDateTime supervisorSignedAt;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AgreementStatus {
        DRAFT,
        PENDING_SIGNATURES,
        ACTIVE,
        MODIFICATION_REQUESTED,
        COMPLETED,
        TERMINATED_EARLY
    }
}
