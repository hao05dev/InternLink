package com.internlink.core.infrastructure.persistence.jpa;
import com.internlink.core.domain.placement.PortfolioRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface JpaPortfolioRevisionRepository extends JpaRepository<PortfolioRevision,UUID> {
    List<PortfolioRevision> findByFormIdOrderByCreatedAtDesc(UUID formId);
    Optional<PortfolioRevision> findFirstByFormIdAndDocxIsNotNullOrderByCreatedAtDesc(UUID formId);
}
