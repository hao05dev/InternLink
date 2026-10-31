package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.domain.organization.StudentRoster;
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
public interface JpaStudentRosterRepository extends JpaRepository<StudentRoster, UUID> {
    Optional<StudentRoster> findByTermIdAndStudentCode(UUID termId, String studentCode);
    Optional<StudentRoster> findByTermIdAndOfficialEmail(UUID termId, String officialEmail);
    List<StudentRoster> findByTermId(UUID termId);
    List<StudentRoster> findByTermIdOrderByStudentCodeAsc(UUID termId);
    List<StudentRoster> findByTermIdAndEligibilityStatus(UUID termId, EligibilityStatus status);
    boolean existsByTermIdAndStudentCode(UUID termId, String studentCode);
    boolean existsByProgram_Id(UUID programId);

    @Query("SELECT r FROM StudentRoster r WHERE r.term.id = :termId AND r.claimedUser.id = :userId")
    Optional<StudentRoster> findByTermIdAndClaimedUserId(@Param("termId") UUID termId,
                                                          @Param("userId") UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM StudentRoster r WHERE r.term.id = :termId AND r.claimedUser.id = :userId")
    Optional<StudentRoster> findByTermIdAndClaimedUserIdForUpdate(@Param("termId") UUID termId,
                                                                 @Param("userId") UUID userId);

    Optional<StudentRoster> findFirstByClaimedUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<StudentRoster> findFirstByOfficialEmailOrderByCreatedAtDesc(String officialEmail);
}
