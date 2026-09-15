package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSkill {

    @EmbeddedId
    private JobSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("jobId")
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Builder.Default
    @Column(name = "is_mandatory")
    private Boolean isMandatory = true; // true = Bắt buộc, false = Điểm cộng / Tùy chọn

    @Builder.Default
    @Column(name = "required_level", length = 30)
    private String requiredLevel = "INTERMEDIATE"; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
}