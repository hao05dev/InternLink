package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "tax_code", length = 50, unique = true)
    private String taxCode;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "address_raw", columnDefinition = "TEXT")
    private String addressRaw;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "work_environment_info", columnDefinition = "TEXT")
    private String workEnvironmentInfo; // An toàn lao động & cơ sở vật chất (ILO 208)

    @Builder.Default
    @Column(name = "mou_status", length = 30)
    private String mouStatus = "NONE"; // NONE, SIGNED, EXPIRED

    @Builder.Default
    @Column(name = "verification_status", length = 30)
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "created_by_user_id")
    private Long createdByUserId; // User ID của HR tạo công ty

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}