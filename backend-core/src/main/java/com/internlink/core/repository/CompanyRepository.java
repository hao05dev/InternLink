package com.internlink.core.repository;

import com.internlink.core.common.enums.VerificationStatus;
import com.internlink.core.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findByTaxCode(String taxCode);
    List<Company> findByVerificationStatus(VerificationStatus status);
    boolean existsByTaxCode(String taxCode);
}
