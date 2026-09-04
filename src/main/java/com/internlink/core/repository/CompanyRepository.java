package com.internlink.core.repository;

import com.internlink.core.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByStatus(Company.VerificationStatus status);
}
