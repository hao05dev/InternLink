package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rubric_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_agreement_id", nullable = false)
    private LearningAgreement learningAgreement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationType evaluationType; // MIDTERM, FINAL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluatorRole evaluatorRole; // COMPANY_MENTOR, ACADEMIC_SUPERVISOR, SELF_STUDENT

    private Double technicalScore;
    private Double workEthicsScore;
    private Double communicationScore;
    private Double problemSolvingScore;

    private Double totalScore;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(columnDefinition = "TEXT")
    private String strengthDemonstrated;

    @Column(columnDefinition = "TEXT")
    private String improvementNeeded;

    @Builder.Default
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    public enum EvaluationType {
        MIDTERM,
        FINAL
    }

    public enum EvaluatorRole {
        COMPANY_MENTOR,
        ACADEMIC_SUPERVISOR,
        SELF_STUDENT
    }
}
