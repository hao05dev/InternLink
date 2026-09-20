package com.internlink.core.repository;

import com.internlink.core.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByStudentCode(String studentCode);
    Optional<StudentProfile> findByUserId(UUID userId);
    boolean existsByStudentCode(String studentCode);
}
