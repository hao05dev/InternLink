package com.internlink.core.application.placement;

import com.internlink.core.presentation.placement.dto.response.InternshipPlacementResponse;
import com.internlink.core.shared.enums.PlacementStatus;

import java.util.List;
import java.util.UUID;

public interface InternshipPlacementService {
    List<InternshipPlacementResponse> getPlacementsByTerm(UUID termId);
    List<InternshipPlacementResponse> getPlacementsByStudent(UUID studentId);
    List<InternshipPlacementResponse> getPlacementsByMentor(UUID mentorId);
    List<InternshipPlacementResponse> getPlacementsByLecturer(UUID lecturerId);
    InternshipPlacementResponse getPlacementById(UUID id);
    InternshipPlacementResponse activatePlacementFromAgreement(UUID agreementId, UUID lecturerId);
    InternshipPlacementResponse updatePlacementStatus(UUID id, PlacementStatus status);
}