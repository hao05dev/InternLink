package com.internlink.core.repository;

import com.internlink.core.entity.FinalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinalResultRepository extends JpaRepository<FinalResult, UUID> {
    Optional<FinalResult> findByPlacementId(UUID placementId);
}
