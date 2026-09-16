package com.internlink.core.repository;

import com.internlink.core.entity.AssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentHistoryRepository extends JpaRepository<AssignmentHistory, Long> {

    List<AssignmentHistory> findByAssignmentIdOrderByChangedAtDesc(Long assignmentId);
}