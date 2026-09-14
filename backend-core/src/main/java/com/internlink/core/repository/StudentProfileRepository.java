package com.internlink.core.repository;

import com.internlink.core.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);

    Optional<StudentProfile> findByStudentCode(String studentCode);

    boolean existsByStudentCode(String studentCode);

    List<StudentProfile> findByInternshipStatus(String internshipStatus);
}