package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "STUDENT_SKILL", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_STUDENT_SKILL", columnNames = { "ID_SP", "ID_SKILL" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_SS")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SP", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SKILL", nullable = false)
    private Skill skill;

    @Column(name = "LEVEL", length = 50)
    private String level; // e.g., BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

    @Column(name = "YEARS_EXPERIENCE")
    private Double yearsExperience;

    @Builder.Default
    @Column(name = "VERIFIED_STATUS", length = 30)
    private String verifiedStatus = "UNVERIFIED"; // UNVERIFIED, VERIFIED_BY_LECTURER, VERIFIED_BY_PROJECT
}