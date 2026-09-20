package com.internlink.core.repository;

import com.internlink.core.common.enums.TermStatus;
import com.internlink.core.entity.InternshipTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InternshipTermRepository extends JpaRepository<InternshipTerm, UUID> {
    Optional<InternshipTerm> findByCode(String code);
    List<InternshipTerm> findByDepartmentId(UUID departmentId);
    List<InternshipTerm> findByStatus(TermStatus status);
    boolean existsByCode(String code);
}
