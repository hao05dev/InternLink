package com.internlink.core.domain.placement;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.shared.enums.IntroductionLetterStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "introduction_letter_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntroductionLetterRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @Column(name = "target_company_name", nullable = false)
    private String targetCompanyName;

    @Column(name = "target_position")
    private String targetPosition;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 32)
    private IntroductionLetterStatus status = IntroductionLetterStatus.PENDING;

    @Column(name = "issued_code", length = 64, unique = true)
    private String issuedCode;

    @Column(name = "issue_note", columnDefinition = "text")
    private String issueNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_user_id")
    private User processedBy;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;

    @Column(name = "received_at")
    private OffsetDateTime receivedAt;
}
