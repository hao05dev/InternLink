package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.organization.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaDepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByCode(String code);
    boolean existsByCode(String code);
}
