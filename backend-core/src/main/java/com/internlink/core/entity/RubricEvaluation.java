package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rubric_evaluations", uniqueConstraints = {
        @UniqueConstraint(name = "uq_rubric_eval", columnNames = { "learning_agreement_id", "evaluation_type", "evaluator_role", "evaluator_user_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "learning_agreement_id", nullable = false)
    private Long learningAgreementId;

    @Column(name = "evaluation_type", length = 20, nullable = false)
    private String evaluationType; // MIDTERM, FINAL

    @Column(name = "evaluator_role", length = 30, nullable = false)
    private String evaluatorRole; // COMPANY_MENTOR, ACADEMIC_SUPERVISOR, STUDENT_SELF, COUNCIL_MEMBER

    @Column(name = "evaluator_user_id", nullable = false)
    private Long evaluatorUserId;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "strengths_observed", columnDefinition = "TEXT")
    private String strengthsObserved;

    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;

    @Column(name = "future_recommendations", columnDefinition = "TEXT")
    private String futureRecommendations;

    @CreationTimestamp
    @Column(name = "evaluated_at", updatable = false)
    private LocalDateTime evaluatedAt;
}
