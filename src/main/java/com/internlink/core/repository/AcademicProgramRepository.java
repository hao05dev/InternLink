package com.internlink.core.repository;

import com.internlink.core.entity.AcademicProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AcademicProgramRepository extends JpaRepository<AcademicProgram, UUID> {
    Optional<AcademicProgram> findByCode(String code);
    List<AcademicProgram> findByDepartmentId(UUID departmentId);
    boolean existsByCode(String code);
}
