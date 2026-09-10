package com.internlink.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "STUDENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_SP")
    private Integer id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USER", nullable = false, unique = true)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LECTURER")
    private Lecturer lecturer;
    @Column(name = "CODE_STUDENT", length = 30, nullable = false, unique = true)
    private String studentCode;
    @Column(name = "MAJOR", length = 200)
    private String major;
    @Column(name = "FACULTY", length = 200)
    private String faculty;
    @Column(name = "ACADEMIC_YEAR", length = 20)
    private String academicYear;
    @Column(name = "GRADUATION_YEAR", length = 20)
    private String graduationYear;
    @Column(name = "GPA")
    private Double gpa;
    @Builder.Default
    @Column(name = "INTERNSHIP_STATUS", length = 30)
    private String internshipStatus = "NOT_STARTED";
    @Column(name = "BIO", columnDefinition = "TEXT")
    private String bio;
}
