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

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        BLACKLISTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "tax_code", unique = true, length = 50)
    private String taxCode;

    @Column(length = 100)
    private String industry;

    private String website;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address addressEntity;

    @Column(name = "address_raw", columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "work_environment_info", columnDefinition = "TEXT")
    private String workEnvironmentInfo;

    @Builder.Default
    @Column(name = "mou_status", length = 30)
    private String mouStatus = "NONE";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "verification_status", length = 30)
    private VerificationStatus status = VerificationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User representative;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}