package com.internlink.core.repository;

import com.internlink.core.entity.CvAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CvAnalysisRepository extends JpaRepository<CvAnalysis, Long> {

    Optional<CvAnalysis> findByCvId(Long cvId);
}