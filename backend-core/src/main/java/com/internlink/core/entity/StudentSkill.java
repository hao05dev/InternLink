package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkill {

    @EmbeddedId
    private StudentSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentProfileId")
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Builder.Default
    @Column(name = "proficiency_level", length = 20)
    private String proficiencyLevel = "BEGINNER"; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

    @Builder.Default
    @Column(name = "years_experience")
    private Double yearsExperience = 0.0;

    @Builder.Default
    @Column(name = "verified_by_exam")
    private Boolean verifiedByExam = false;
}