package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "placement_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_id", nullable = false)
    private InternshipPlacement placement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_mentor_id", nullable = false)
    private User assignedByMentor;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text", nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "learning_outcomes", columnDefinition = "jsonb", nullable = false)
    private List<String> learningOutcomes = List.of();

    @Column(name = "due_at")
    private OffsetDateTime dueAt;

    @Builder.Default
    @Column(name = "progress_percent", nullable = false)
    private Integer progressPercent = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private TaskStatus status = TaskStatus.ASSIGNED;

    @Column(name = "submission_summary", columnDefinition = "text")
    private String submissionSummary;

    @Column(name = "mentor_feedback", columnDefinition = "text")
    private String mentorFeedback;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;
}
