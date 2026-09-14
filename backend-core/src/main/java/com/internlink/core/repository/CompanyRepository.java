package com.internlink.core.repository;

import com.internlink.core.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByVerificationStatus(String verificationStatus);

    Optional<Company> findByCreatedByUserId(Long createdByUserId);

    Optional<Company> findByTaxCode(String taxCode);

    boolean existsByTaxCode(String taxCode);
}