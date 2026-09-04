package com.internlink.core.repository;

import com.internlink.core.entity.Logbook;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogbookRepository extends JpaRepository<Logbook, Long> {
    List<Logbook> findByLearningAgreementIdOrderByWeekNumberAsc(Long agreementId);
}
