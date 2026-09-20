package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.OfferStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "placement_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementOffer extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private JobApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposed_mentor_id")
    private User proposedMentor;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "stipend", precision = 12, scale = 2)
    private BigDecimal stipend;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "terms_snapshot", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> termsSnapshot = Map.of();

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private OfferStatus status = OfferStatus.SENT;

    @Column(name = "responded_at")
    private OffsetDateTime respondedAt;
}
