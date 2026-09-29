package com.internlink.core.infrastructure.persistence.jpa;
import com.internlink.core.domain.placement.PortfolioForm;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface JpaPortfolioFormRepository extends JpaRepository<PortfolioForm,UUID> {
    List<PortfolioForm> findByPlacementId(UUID placementId);
    Optional<PortfolioForm> findByPlacementIdAndKind(UUID placementId,String kind);
}
