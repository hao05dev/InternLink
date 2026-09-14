package com.internlink.core.repository;

import com.internlink.core.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByStatus(Company.VerificationStatus status);
    Optional<Company> findByTaxCode(String taxCode);
}
