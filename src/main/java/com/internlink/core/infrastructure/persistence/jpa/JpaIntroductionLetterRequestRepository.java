package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.placement.IntroductionLetterRequest;
import com.internlink.core.shared.enums.IntroductionLetterStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaIntroductionLetterRequestRepository extends JpaRepository<IntroductionLetterRequest, UUID> {

    List<IntroductionLetterRequest> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    Optional<IntroductionLetterRequest> findFirstByStudentIdAndTermIdOrderByCreatedAtDesc(UUID studentId, UUID termId);

    List<IntroductionLetterRequest> findByTermIdOrderByCreatedAtDesc(UUID termId);

    @Query("SELECT r FROM IntroductionLetterRequest r WHERE r.student.id = :studentId AND r.term.id = :termId AND r.status IN :statuses")
    List<IntroductionLetterRequest> findActiveRequestsByStudentAndTerm(
            @Param("studentId") UUID studentId,
            @Param("termId") UUID termId,
            @Param("statuses") List<IntroductionLetterStatus> statuses
    );

    Optional<IntroductionLetterRequest> findByIssuedCode(String issuedCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM IntroductionLetterRequest r WHERE r.id = :id")
    Optional<IntroductionLetterRequest> findByIdForUpdate(@Param("id") UUID id);
}
