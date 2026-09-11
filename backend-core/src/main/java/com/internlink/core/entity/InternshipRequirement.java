package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "INTERNSHIP_REQUIREMENT", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_POSTING_SKILL", columnNames = { "ID_IP", "ID_SKILL" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_REQUIREMENT")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_IP", nullable = false)
    private InternshipPosting internshipPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SKILL", nullable = false)
    private Skill skill;

    @Column(name = "REQUIRED_LEVEL", length = 50)
    private String requiredLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    @Builder.Default
    @Column(name = "IS_MANDATORY")
    private Boolean isMandatory = false;
}