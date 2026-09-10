package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DEPARTMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DEPARTMENT")
    private Integer id;

    @Column(name = "DEPARTMENT_NAME", length = 150, nullable = false)
    private String name;

    @Column(name = "DEPARTMENT_TYPE", length = 50)
    private String type;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "STATUS", length = 50)
    private String status = "ACTIVE";
}
