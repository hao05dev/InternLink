package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.organization.FacultyLecturerQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaFacultyLecturerQuotaRepository extends JpaRepository<FacultyLecturerQuota, UUID> {
    Optional<FacultyLecturerQuota> findByLecturerIdAndTermId(UUID lecturerId, UUID termId);
    List<FacultyLecturerQuota> findByTermId(UUID termId);
}
