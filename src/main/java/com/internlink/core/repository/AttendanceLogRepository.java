package com.internlink.core.repository;

import com.internlink.core.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, UUID> {
    List<AttendanceLog> findByPlacementId(UUID placementId);
    Optional<AttendanceLog> findByPlacementIdAndWorkDate(UUID placementId, LocalDate workDate);
    List<AttendanceLog> findByPlacementIdOrderByWorkDateDesc(UUID placementId);
}
