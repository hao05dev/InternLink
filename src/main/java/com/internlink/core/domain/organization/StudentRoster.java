package com.internlink.core.domain.organization;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.domain.auth.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
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

    @Column(name = "class_code", length = 50)
    private String classCode;

    @Column(name = "internship_course_code", length = 30)
    private String internshipCourseCode;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_lecturer_id")
    private User assignedLecturer;

    @Column(name = "lecturer_code", length = 50)
    private String lecturerCode;

    @Column(name = "lecturer_name", length = 150)
    private String lecturerName;

    @Column(name = "lecturer_email", length = 150)
    private String lecturerEmail;

    @Builder.Default
    @Column(name = "letter_received", nullable = false)
    private boolean letterReceived = false;

    @Column(name = "letter_received_at")
    private OffsetDateTime letterReceivedAt;

    @Column(name = "letter_notes", columnDefinition = "text")
    private String letterNotes;

    @Column(name = "gpa", precision = 3, scale = 2)
    private BigDecimal gpa;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
}
