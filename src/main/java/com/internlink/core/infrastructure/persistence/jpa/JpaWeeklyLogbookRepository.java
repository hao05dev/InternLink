package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.placement.WeeklyLogbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaWeeklyLogbookRepository extends JpaRepository<WeeklyLogbook, UUID> {
    List<WeeklyLogbook> findByPlacementIdOrderByWeekNumberAsc(UUID placementId);
    Optional<WeeklyLogbook> findByPlacementIdAndWeekNumber(UUID placementId, Integer weekNumber);
}
