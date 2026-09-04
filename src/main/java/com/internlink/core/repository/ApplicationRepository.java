package com.internlink.core.repository;

import com.internlink.core.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentProfileId(Long studentProfileId);
    List<Application> findByJobId(Long jobId);
}
