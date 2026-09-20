package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.ResultStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "final_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalResult extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_id", nullable = false, unique = true)
    private InternshipPlacement placement;

    @Column(name = "mentor_score", precision = 5, scale = 2)
    private BigDecimal mentorScore;

    @Column(name = "lecturer_score", precision = 5, scale = 2)
    private BigDecimal lecturerScore;

    @Column(name = "compliance_score", precision = 5, scale = 2)
    private BigDecimal complianceScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "component_breakdown", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> componentBreakdown = Map.of();

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "result_status", nullable = false, length = 30)
    private ResultStatus resultStatus = ResultStatus.PENDING_REVIEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_user_id")
    private User decidedBy;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "finalized_at")
    private OffsetDateTime finalizedAt;
}
