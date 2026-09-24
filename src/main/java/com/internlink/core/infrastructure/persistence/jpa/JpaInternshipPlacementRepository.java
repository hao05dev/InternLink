package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.domain.placement.InternshipPlacement;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
