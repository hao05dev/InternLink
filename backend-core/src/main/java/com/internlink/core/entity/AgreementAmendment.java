package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "agreement_amendments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementAmendment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "learning_agreement_id", nullable = false)
    private Long learningAgreementId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "reason_for_change", columnDefinition = "TEXT", nullable = false)
    private String reasonForChange;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "changes_summary", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> changesSummary;

    @Builder.Default
    @Column(name = "approved_by_student")
    private Boolean approvedByStudent = false;

    @Builder.Default
    @Column(name = "approved_by_mentor")
    private Boolean approvedByMentor = false;

    @Builder.Default
    @Column(name = "approved_by_supervisor")
    private Boolean approvedBySupervisor = false;

    @CreationTimestamp
    @Column(name = "amended_at", updatable = false)
    private LocalDateTime amendedAt;
}