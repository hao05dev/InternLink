package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.domain.company.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaCompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findByTaxCode(String taxCode);
    List<Company> findByVerificationStatus(VerificationStatus status);
    boolean existsByTaxCode(String taxCode);
}
