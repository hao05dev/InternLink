package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "COMPANY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_COMPANY")
    private Integer id;

    @Column(name = "NAME_COMPANY", length = 200, nullable = false)
    private String nameCompany;

    @Column(name = "TAX_CODE", length = 50, unique = true)
    private String taxCode;

    @Column(name = "ADDRESS", columnDefinition = "TEXT")
    private String address;

    @Column(name = "WEBSITE", length = 255)
    private String website;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "VERIFICATION_STATUS", length = 30)
    private String verificationStatus = "PENDING";

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}