package com.internlink.core.domain.system;

import com.internlink.core.domain.system.StateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StateHistoryRepository extends JpaRepository<StateHistory, UUID> {
    List<StateHistory> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);
}
