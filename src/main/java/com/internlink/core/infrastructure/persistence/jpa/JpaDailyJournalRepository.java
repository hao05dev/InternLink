package com.internlink.core.infrastructure.persistence.jpa;
import com.internlink.core.domain.placement.DailyJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;
public interface JpaDailyJournalRepository extends JpaRepository<DailyJournal,UUID> {
    List<DailyJournal> findByPlacementIdOrderByWorkDateAsc(UUID placementId);
    Optional<DailyJournal> findByPlacementIdAndWorkDate(UUID placementId, LocalDate workDate);
}
