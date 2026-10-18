package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.auth.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaRefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.family f JOIN FETCH f.user u WHERE r.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashWithFamilyAndUser(@Param("tokenHash") String tokenHash);

    Optional<RefreshToken> findByTokenHash(String tokenHash);
}
