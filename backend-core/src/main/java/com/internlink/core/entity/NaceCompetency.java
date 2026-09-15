package com.internlink.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "nace_competencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaceCompetency {

    @Id
    @Column(name = "code", length = 30)
    private String code; // e.g. CRITICAL_THINKING, COMMUNICATION, TEAMWORK, TECHNOLOGY, LEADERSHIP, PROFESSIONALISM, CAREER_DEV, EQUITY_INCLUSION

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
