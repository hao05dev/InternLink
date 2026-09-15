package com.internlink.core.repository;

import com.internlink.core.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByStudentProfileIdOrderByAppliedAtDesc(Long studentProfileId);

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    Optional<Application> findByStudentProfileIdAndJobId(Long studentProfileId, Long jobId);

    boolean existsByStudentProfileIdAndJobId(Long studentProfileId, Long jobId);
}