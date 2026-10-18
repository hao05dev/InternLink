package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.auth.AuthSessionFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaAuthSessionFamilyRepository extends JpaRepository<AuthSessionFamily, UUID> {

    List<AuthSessionFamily> findByUserIdAndRevokedAtIsNull(UUID userId);

    @Modifying
    @Query("UPDATE AuthSessionFamily f SET f.revokedAt = :revokedAt, f.revokeReason = :reason WHERE f.user.id = :userId AND f.revokedAt IS NULL")
    int revokeAllActiveFamiliesByUserId(
            @Param("userId") UUID userId,
            @Param("revokedAt") OffsetDateTime revokedAt,
            @Param("reason") String reason
    );
}
