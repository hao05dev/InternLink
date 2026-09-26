package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.domain.organization.StudentRoster;
import org.springframework.data.jpa.repository.JpaRepository;
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
    List<StudentRoster> findByTermIdAndEligibilityStatus(UUID termId, EligibilityStatus status);
    boolean existsByTermIdAndStudentCode(UUID termId, String studentCode);

    /**
     * Tìm roster record của sinh viên trong kỳ thực tập bằng user ID.
     * Liên kết qua claimed_user_id — sinh viên phải đã "claim" roster của mình.
     */
    @Query("SELECT r FROM StudentRoster r WHERE r.term.id = :termId AND r.claimedUser.id = :userId")
    Optional<StudentRoster> findByTermIdAndClaimedUserId(@Param("termId") UUID termId,
                                                          @Param("userId") UUID userId);
}
