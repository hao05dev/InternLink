package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {
    @Id
    private String id; // e.g., 'SK-SPRING-BOOT'

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String category; // Language, Backend, Frontend, Database, DevOps, etc.

    @Column(columnDefinition = "TEXT")
    private String synonyms; // comma separated
}
