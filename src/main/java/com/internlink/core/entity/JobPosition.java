package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.JobStatus;
import com.internlink.core.common.enums.WorkFormat;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "job_positions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_format", nullable = false, length = 30)
    private WorkFormat workFormat;

    @Column(name = "location", nullable = false)
    private String location;

    @Builder.Default
    @Column(name = "vacancies", nullable = false)
    private Integer vacancies = 1;

    @Column(name = "description", columnDefinition = "text", nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "target_program_codes", columnDefinition = "jsonb", nullable = false)
    private List<String> targetProgramCodes = List.of();

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "target_learning_outcomes", columnDefinition = "jsonb", nullable = false)
    private List<String> targetLearningOutcomes = List.of();

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "benefits", columnDefinition = "jsonb", nullable = false)
    private List<String> benefits = List.of();

    @Column(name = "stipend_amount", precision = 12, scale = 2)
    private BigDecimal stipendAmount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private JobStatus status = JobStatus.DRAFT;

    @Column(name = "faculty_feedback", columnDefinition = "text")
    private String facultyFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;
}
