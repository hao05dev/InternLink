package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.CaseSeverity;
import com.internlink.core.common.enums.CaseStatus;
import com.internlink.core.common.enums.CaseType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "internship_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipCase extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_id", nullable = false)
    private InternshipPlacement placement;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_type", nullable = false, length = 40)
    private CaseType caseType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id", nullable = false)
    private User reportedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedToUser;

    @Column(name = "related_entity_type", length = 40)
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private UUID relatedEntityId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "severity", nullable = false, length = 20)
    private CaseSeverity severity = CaseSeverity.NORMAL;

    @Column(name = "summary", columnDefinition = "text", nullable = false)
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "detail", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> detail = Map.of();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resolution", columnDefinition = "jsonb")
    private Map<String, Object> resolution;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private CaseStatus status = CaseStatus.OPEN;

    @CreationTimestamp
    @Column(name = "opened_at", nullable = false)
    private OffsetDateTime openedAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;
}
