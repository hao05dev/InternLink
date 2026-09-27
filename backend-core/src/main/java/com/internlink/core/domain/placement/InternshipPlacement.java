package com.internlink.core.domain.placement;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.evaluation.AssessmentScheme;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;



@Entity
@Table(name = "internship_placements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipPlacement extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id", unique = true)
    private LearningAgreement agreement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @Builder.Default
    @Column(name = "source", nullable = false, length = 20)
    private String source = "PARTNER_PORTAL";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_found_application_id", unique = true)
    private StudentFoundApplication studentFoundApplication;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_scheme_id")
    private AssessmentScheme assessmentScheme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private User lecturer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "work_schedule", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> workSchedule = Map.of();

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Builder.Default
    @Column(name = "total_hours_worked", precision = 7, scale = 2, nullable = false)
    private BigDecimal totalHoursWorked = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private PlacementStatus status = PlacementStatus.PREPARING;
}
