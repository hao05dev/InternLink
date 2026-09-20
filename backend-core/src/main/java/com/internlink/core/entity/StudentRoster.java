package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.EligibilityStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "student_rosters", uniqueConstraints = {
    @UniqueConstraint(name = "uq_student_rosters_term_student", columnNames = {"term_id", "student_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRoster extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private AcademicProgram program;

    @Column(name = "student_code", nullable = false, length = 50)
    private String studentCode;

    @Column(name = "official_email", nullable = false, length = 150)
    private String officialEmail;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "eligibility_status", nullable = false, length = 30)
    private EligibilityStatus eligibilityStatus = EligibilityStatus.ELIGIBLE;

    @Column(name = "eligibility_note", columnDefinition = "text")
    private String eligibilityNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claimed_user_id")
    private User claimedUser;

    @Column(name = "claimed_at")
    private OffsetDateTime claimedAt;
}
