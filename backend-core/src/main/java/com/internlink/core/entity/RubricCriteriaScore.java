package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rubric_criteria_scores", uniqueConstraints = {
        @UniqueConstraint(name = "uq_criteria_score", columnNames = { "evaluation_id", "competency_code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricCriteriaScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "evaluation_id", nullable = false)
    private Long evaluationId;

    @Column(name = "competency_code", length = 30, nullable = false)
    private String competencyCode;

    @Column(name = "score", nullable = false)
    private Double score; // 0.0 đến 10.0

    @Column(name = "behavioral_evidence", columnDefinition = "TEXT")
    private String behavioralEvidence;
}
