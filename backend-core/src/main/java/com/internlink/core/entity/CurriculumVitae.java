package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "CURRICULUM_VITAE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumVitae {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CV")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SP", nullable = false)
    private Student student;

    @Column(name = "FILE_URL", length = 500, nullable = false)
    private String fileUrl;

    @Column(name = "PARSED_TEXT", columnDefinition = "TEXT")
    private String parsedText;

    @Builder.Default
    @Column(name = "IS_DEFAULT")
    private Boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}