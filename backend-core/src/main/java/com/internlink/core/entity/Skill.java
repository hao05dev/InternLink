package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SKILL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_SKILL")
    private Integer id;

    @Column(name = "NAME_SKILL", length = 100, nullable = false)
    private String skill;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

}
