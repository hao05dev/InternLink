package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.AgreementStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "learning_agreements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningAgreement extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false, unique = true)
    private PlacementOffer offer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "target_credits", nullable = false)
    private Integer targetCredits;

    @Column(name = "learning_objectives", columnDefinition = "text", nullable = false)
    private String learningObjectives;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 40)
    private AgreementStatus status = AgreementStatus.DRAFT;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "student_signature", columnDefinition = "jsonb")
    private Map<String, Object> studentSignature;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "company_signature", columnDefinition = "jsonb")
    private Map<String, Object> companySignature;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "faculty_signature", columnDefinition = "jsonb")
    private Map<String, Object> facultySignature;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "amendments", columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Object>> amendments = List.of();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;
}
