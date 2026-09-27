package com.internlink.core.domain.placement;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "internship_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InternshipReport extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "placement_id", nullable = false)
    private InternshipPlacement placement;
    @Column(name = "report_type", nullable = false, length = 20)
    private String reportType;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "document_id", nullable = false)
    private Document document;
    @Column(name = "status", nullable = false, length = 25)
    private String status;
    @Column(name = "lecturer_feedback", columnDefinition = "text")
    private String lecturerFeedback;
    @Column(name = "was_late", nullable = false)
    private Boolean wasLate;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;
    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;
    @Column(name = "submitted_at", nullable = false)
    private OffsetDateTime submittedAt;
}
