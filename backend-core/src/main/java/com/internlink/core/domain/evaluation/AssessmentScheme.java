package com.internlink.core.domain.evaluation;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "assessment_schemes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentScheme extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "program_id", nullable = false)
    private AcademicProgram program;
    @Column(name = "cohort_code", nullable = false, length = 30)
    private String cohortCode;
    @Column(name = "course_code", nullable = false, length = 30)
    private String courseCode;
    @Column(name = "revision", nullable = false)
    private Integer revision;
    @Column(name = "source_reference", nullable = false, columnDefinition = "text")
    private String sourceReference;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "components", nullable = false, columnDefinition = "jsonb")
    private List<Map<String, Object>> components;
    @Column(name = "required_logbook_weeks", nullable = false)
    private Integer requiredLogbookWeeks;
    @Column(name = "weekly_grace_days", nullable = false)
    private Integer weeklyGraceDays;
    @Column(name = "require_midterm_report", nullable = false)
    private Boolean requireMidtermReport;
    @Column(name = "require_final_report", nullable = false)
    private Boolean requireFinalReport;
    @Column(name = "midterm_report_due_at")
    private OffsetDateTime midtermReportDueAt;
    @Column(name = "final_report_due_at")
    private OffsetDateTime finalReportDueAt;
    @Column(name = "status", nullable = false, length = 20)
    private String status;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;
    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;
}
