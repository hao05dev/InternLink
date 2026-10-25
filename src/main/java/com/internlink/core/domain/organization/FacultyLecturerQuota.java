package com.internlink.core.domain.organization;

import com.internlink.core.domain.auth.User;
import com.internlink.core.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faculty_lecturer_quotas", uniqueConstraints = {
    @UniqueConstraint(name = "uq_faculty_lecturer_term_quota", columnNames = {"term_id", "lecturer_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyLecturerQuota extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private User lecturer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "term_id", nullable = false)
    private InternshipTerm term;

    @Builder.Default
    @Column(name = "max_students", nullable = false)
    private Integer maxStudents = 15;

    @Column(name = "notes")
    private String notes;
}
