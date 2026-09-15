package com.internlink.core.repository;

import com.internlink.core.entity.MatchingResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchingResultRepository extends JpaRepository<MatchingResult, Long> {

    List<MatchingResult> findByStudentProfileIdOrderByOverallScoreDesc(Long studentProfileId);

    List<MatchingResult> findByJobIdOrderByOverallScoreDesc(Long jobId);

    Optional<MatchingResult> findByJobIdAndStudentProfileId(Long jobId, Long studentProfileId);
}