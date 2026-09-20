package com.internlink.core.repository;

import com.internlink.core.common.enums.OfferStatus;
import com.internlink.core.entity.PlacementOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlacementOfferRepository extends JpaRepository<PlacementOffer, UUID> {
    Optional<PlacementOffer> findByApplicationId(UUID applicationId);
    List<PlacementOffer> findByStatus(OfferStatus status);
}
