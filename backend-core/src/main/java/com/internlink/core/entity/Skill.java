package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @Column(name = "id", length = 50)
    private String id; // e.g., 'SK-JAVA', 'SK-SPRING-BOOT'

    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Column(name = "category", length = 50, nullable = false)
    private String category; // e.g., Programming Language, Backend, Frontend, DevOps, SoftSkill

    @Column(name = "esco_uri", length = 255)
    private String escoUri;

    @Column(name = "synonyms", columnDefinition = "TEXT")
    private String synonyms;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}