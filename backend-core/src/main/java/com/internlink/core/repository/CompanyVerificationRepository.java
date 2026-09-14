package com.internlink.core.repository;

import com.internlink.core.entity.CompanyVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyVerificationRepository extends JpaRepository<CompanyVerification, Long> {

    List<CompanyVerification> findByCompanyIdOrderByReviewedAtDesc(Long companyId);
}