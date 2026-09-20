package com.internlink.core.repository;

import com.internlink.core.entity.StateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StateHistoryRepository extends JpaRepository<StateHistory, UUID> {
    List<StateHistory> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);
}
