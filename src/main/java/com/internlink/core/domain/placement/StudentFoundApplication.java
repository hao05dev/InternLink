package com.internlink.core.domain.placement;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.system.Document;
import com.internlink.core.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "student_found_applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentFoundApplication extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id", nullable = false)
    private User student;
    @Column(name = "host_name", nullable = false)
    private String hostName;
    @Column(name = "host_address", nullable = false, columnDefinition = "text")
    private String hostAddress;
    @Column(name = "contact_name", nullable = false)
    private String contactName;
    @Column(name = "contact_email", nullable = false)
    private String contactEmail;
    @Column(name = "work_description", nullable = false, columnDefinition = "text")
    private String workDescription;
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "acceptance_document_id")
    private Document acceptanceDocument;
    @Column(name = "status", nullable = false, length = 25)
    private String status;
    @Column(name = "review_note", columnDefinition = "text")
    private String reviewNote;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;
    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;
}
