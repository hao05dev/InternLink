package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.OfferStatus;
import com.internlink.core.domain.recruitment.PlacementOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaPlacementOfferRepository extends JpaRepository<PlacementOffer, UUID> {
    Optional<PlacementOffer> findByApplicationId(UUID applicationId);
    List<PlacementOffer> findByStatus(OfferStatus status);
    @Query("SELECT COUNT(o) FROM PlacementOffer o WHERE o.application.job.id = :jobId "
        + "AND (o.status = 'ACCEPTED' OR (o.status = 'SENT' AND o.expiresAt > :now))")
    long countReservedPlaces(@Param("jobId") UUID jobId, @Param("now") OffsetDateTime now);
}
