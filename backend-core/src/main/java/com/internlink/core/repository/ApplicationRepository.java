package com.internlink.core.repository;

import com.internlink.core.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentProfileId(Long studentProfileId);
    List<Application> findByJobId(Long jobId);
    Optional<Application> findByStudentProfileIdAndJobId(Long studentProfileId, Long jobId);
}
