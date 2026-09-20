package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "academic_programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicProgram extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Builder.Default
    @Column(name = "degree_level", nullable = false, length = 30)
    private String degreeLevel = "UNDERGRADUATE";

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
