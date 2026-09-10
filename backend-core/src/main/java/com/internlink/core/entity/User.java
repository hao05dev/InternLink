package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "USERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USER")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UT", nullable = false)
    private UserType userType;

    @Column(name = "NAME_USER", length = 100)
    private String username;

    @Column(name = "FULL_NAME", length = 200, nullable = false)
    private String fullName;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "EMAIL", length = 150, nullable = false)
    private String email;

    @Column(name = "ADDRESS", columnDefinition = "TEXT")
    private String address;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "PASSWORD", length = 255, nullable = false)
    private String password;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "ACTIVE";

    @Column(name = "AVATAR_URL", length = 500)
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
