package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.OfferStatus;
import com.internlink.core.domain.recruitment.PlacementOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaPlacementOfferRepository extends JpaRepository<PlacementOffer, UUID> {
    Optional<PlacementOffer> findByApplicationId(UUID applicationId);
    List<PlacementOffer> findByStatus(OfferStatus status);
}
