package com.internlink.core.repository;

import com.internlink.core.common.enums.TaskStatus;
import com.internlink.core.entity.PlacementTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlacementTaskRepository extends JpaRepository<PlacementTask, UUID> {
    List<PlacementTask> findByPlacementId(UUID placementId);
    List<PlacementTask> findByPlacementIdAndStatus(UUID placementId, TaskStatus status);
}
