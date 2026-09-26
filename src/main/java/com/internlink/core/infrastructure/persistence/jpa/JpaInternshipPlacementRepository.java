package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.domain.placement.InternshipPlacement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaInternshipPlacementRepository extends JpaRepository<InternshipPlacement, UUID> {
    Optional<InternshipPlacement> findByAgreementId(UUID agreementId);
    List<InternshipPlacement> findByStudentId(UUID studentId);
    List<InternshipPlacement> findByMentorId(UUID mentorId);
    List<InternshipPlacement> findByLecturerId(UUID lecturerId);
    List<InternshipPlacement> findByTermId(UUID termId);
    List<InternshipPlacement> findByTermIdAndStatus(UUID termId, PlacementStatus status);

    /**
     * Đếm số placement trong kỳ chưa kết thúc (không phải COMPLETED/TERMINATED/TRANSFERRED).
     * Dùng để kiểm tra trước khi chuyển kỳ sang CLOSED.
     */
    @Query("""
        SELECT COUNT(p) FROM InternshipPlacement p
        WHERE p.term.id = :termId
          AND p.status NOT IN ('COMPLETED', 'TERMINATED', 'TRANSFERRED')
        """)
    long countUnfinishedPlacementsByTerm(@Param("termId") UUID termId);

    /**
     * Đếm số placement đã hoàn thành thành công trong kỳ — dùng cho báo cáo.
     */
    long countByTermIdAndStatus(UUID termId, PlacementStatus status);
}
