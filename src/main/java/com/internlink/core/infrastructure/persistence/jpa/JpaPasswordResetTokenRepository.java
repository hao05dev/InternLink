package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.auth.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaPasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    @org.springframework.data.jpa.repository.Modifying
    @Query("update PasswordResetToken t set t.usedAt = :now where t.id = :id and t.usedAt is null and t.expiresAt > :now")
    int consume(@Param("id") UUID id, @Param("now") OffsetDateTime now);

    @org.springframework.data.jpa.repository.Modifying
    @Query("update PasswordResetToken t set t.usedAt = :now where t.user.id = :userId and t.usedAt is null")
    int invalidateAllForUser(@Param("userId") UUID userId, @Param("now") OffsetDateTime now);

    @Query("SELECT t FROM PasswordResetToken t JOIN FETCH t.user WHERE t.tokenHash = :tokenHash AND t.usedAt IS NULL AND t.expiresAt > :now")
    Optional<PasswordResetToken> findValidToken(@Param("tokenHash") String tokenHash, @Param("now") OffsetDateTime now);

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
