package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.TaskStatus;
import com.internlink.core.domain.placement.PlacementTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;



@Repository
public interface JpaPlacementTaskRepository extends JpaRepository<PlacementTask, UUID> {
    List<PlacementTask> findByPlacementId(UUID placementId);
    List<PlacementTask> findByPlacementIdAndStatus(UUID placementId, TaskStatus status);
}
