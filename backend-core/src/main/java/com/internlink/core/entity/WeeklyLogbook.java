package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.LogbookStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "weekly_logbooks", uniqueConstraints = {
    @UniqueConstraint(name = "uq_weekly_logbooks_placement_week", columnNames = {"placement_id", "week_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyLogbook extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_id", nullable = false)
    private InternshipPlacement placement;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "tasks_completed", columnDefinition = "text", nullable = false)
    private String tasksCompleted;

    @Column(name = "learning_reflection", columnDefinition = "text", nullable = false)
    private String learningReflection;

    @Column(name = "total_hours", precision = 5, scale = 2, nullable = false)
    private BigDecimal totalHours;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private LogbookStatus status = LogbookStatus.DRAFT;

    @Column(name = "mentor_feedback", columnDefinition = "text")
    private String mentorFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_reviewed_by")
    private User mentorReviewedBy;

    @Column(name = "mentor_reviewed_at")
    private OffsetDateTime mentorReviewedAt;

    @Column(name = "lecturer_comment", columnDefinition = "text")
    private String lecturerComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_commented_by")
    private User lecturerCommentedBy;

    @Column(name = "lecturer_commented_at")
    private OffsetDateTime lecturerCommentedAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;
}
