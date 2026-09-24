package com.internlink.core.domain.evaluation;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.shared.enums.RubricStage;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;



@Entity
@Table(name = "rubric_evaluations", uniqueConstraints = {
    @UniqueConstraint(name = "uq_rubric_evaluations_placement_evaluator_stage", columnNames = {"placement_id", "evaluator_id", "evaluation_stage"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricEvaluation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_id", nullable = false)
    private InternshipPlacement placement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluator_role", nullable = false, length = 30)
    private UserRole evaluatorRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_stage", nullable = false, length = 20)
    private RubricStage evaluationStage;

    @Column(name = "rubric_version", nullable = false, length = 50)
    private String rubricVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "criteria_scores", columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Object>> criteriaScores;

    @Column(name = "final_score", precision = 5, scale = 2, nullable = false)
    private BigDecimal finalScore;

    @Column(name = "qualitative_feedback", columnDefinition = "text")
    private String qualitativeFeedback;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;
}
