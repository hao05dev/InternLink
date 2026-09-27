package com.internlink.core.domain.evaluation;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.system.Document;
import com.internlink.core.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "assessment_component_scores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentComponentScore extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "placement_id", nullable = false)
    private InternshipPlacement placement;
    @Column(name = "component_code", nullable = false, length = 50)
    private String componentCode;
    @Column(name = "score", nullable = false, precision = 4, scale = 1)
    private BigDecimal score;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "criteria_scores", nullable = false, columnDefinition = "jsonb")
    private Map<String, BigDecimal> criteriaScores;
    @Column(name = "source", nullable = false, length = 20)
    private String source;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "evidence_document_id")
    private Document evidenceDocument;
    @Column(name = "status", nullable = false, length = 20)
    private String status;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "submitted_by_user_id", nullable = false)
    private User submittedBy;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;
    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;
}
