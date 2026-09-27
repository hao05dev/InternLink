package com.internlink.core.application.exception_case.impl;

import com.internlink.core.application.exception_case.InternshipCaseService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.exception_case.InternshipCase;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipCaseRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.exception_case.dto.request.InternshipCaseRequest;
import com.internlink.core.presentation.exception_case.dto.response.InternshipCaseResponse;
import com.internlink.core.shared.enums.CaseStatus;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternshipCaseServiceImpl implements InternshipCaseService {

    private final JpaInternshipCaseRepository caseRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InternshipCaseResponse> getCasesByPlacement(UUID placementId) {
        return caseRepository.findByPlacementId(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipCaseResponse> getCasesByStatus(CaseStatus status) {
        return caseRepository.findByStatus(status).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InternshipCaseResponse getCaseById(UUID id) {
        InternshipCase c = caseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipCase", "id", id));
        return mapToResponse(c);
    }

    @Override
    @Transactional
    public InternshipCaseResponse reportCase(UUID reporterId, InternshipCaseRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterId));

        InternshipCase c = InternshipCase.builder()
            .placement(placement)
            .caseType(request.getCaseType())
            .reportedByUser(reporter)
            .severity(request.getSeverity())
            .summary(request.getSummary().trim())
            .detail(request.getDetail() != null ? request.getDetail() : Map.of())
            .relatedEntityType(request.getRelatedEntityType())
            .relatedEntityId(request.getRelatedEntityId())
            .status(CaseStatus.OPEN)
            .openedAt(OffsetDateTime.now())
            .build();

        return mapToResponse(caseRepository.save(c));
    }

    @Override
    @Transactional
    public InternshipCaseResponse resolveCase(UUID id, UUID resolverId, CaseStatus status, Map<String, Object> resolution) {
        InternshipCase c = caseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipCase", "id", id));

        User resolver = userRepository.findById(resolverId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", resolverId));

        c.setStatus(status);
        c.setResolution(resolution != null ? resolution : Map.of());
        c.setAssignedToUser(resolver);
        c.setResolvedAt(OffsetDateTime.now());

        return mapToResponse(caseRepository.save(c));
    }

    private InternshipCaseResponse mapToResponse(InternshipCase entity) {
        return InternshipCaseResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .studentName(entity.getPlacement().getStudent().getFullName())
            .companyName(entity.getPlacement().getCompany() != null
                ? entity.getPlacement().getCompany().getCompanyName()
                : entity.getPlacement().getStudentFoundApplication().getHostName())
            .caseType(entity.getCaseType())
            .reportedByUserId(entity.getReportedByUser().getId())
            .reportedByName(entity.getReportedByUser().getFullName())
            .assignedToUserId(entity.getAssignedToUser() != null ? entity.getAssignedToUser().getId() : null)
            .assignedToName(entity.getAssignedToUser() != null ? entity.getAssignedToUser().getFullName() : null)
            .severity(entity.getSeverity())
            .summary(entity.getSummary())
            .detail(entity.getDetail())
            .resolution(entity.getResolution())
            .status(entity.getStatus())
            .openedAt(entity.getOpenedAt())
            .resolvedAt(entity.getResolvedAt())
            .build();
    }
}
