package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "term_student_registrations", uniqueConstraints = {
        @UniqueConstraint(name = "uq_term_student", columnNames = { "internship_term_id", "student_profile_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TermStudentRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "internship_term_id", nullable = false)
    private Long internshipTermId;

    @Column(name = "student_profile_id", nullable = false)
    private Long studentProfileId;

    @Column(name = "course_class_code", length = 50)
    private String courseClassCode; // Mã lớp học phần (ví dụ: INTP4312_01)

    @Builder.Default
    @Column(name = "is_eligible")
    private Boolean isEligible = true; // Đủ điều kiện thực tập

    @CreationTimestamp
    @Column(name = "imported_at", updatable = false)
    private LocalDateTime importedAt;
}