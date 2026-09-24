package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.AttendanceLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.AttendanceLog;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.infrastructure.persistence.jpa.JpaAttendanceLogRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.placement.dto.request.AttendanceLogRequest;
import com.internlink.core.presentation.placement.dto.response.AttendanceLogResponse;
import com.internlink.core.shared.enums.AttendanceStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceLogServiceImpl implements AttendanceLogService {

    private final JpaAttendanceLogRepository attendanceRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceLogResponse> getAttendanceByPlacement(UUID placementId) {
        return attendanceRepository.findByPlacementId(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceLogResponse getAttendanceById(UUID id) {
        AttendanceLog log = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AttendanceLog", "id", id));
        return mapToResponse(log);
    }

    @Override
    @Transactional
    public AttendanceLogResponse checkIn(AttendanceLogRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        AttendanceLog log = AttendanceLog.builder()
            .placement(placement)
            .workDate(request.getWorkDate())
            .checkInAt(request.getCheckInAt() != null ? request.getCheckInAt() : OffsetDateTime.now())
            .workFormat(request.getWorkFormat())
            .checkInLocation(request.getCheckInLocation() != null ? request.getCheckInLocation() : Map.of())
            .status(AttendanceStatus.OPEN)
            .build();

        return mapToResponse(attendanceRepository.save(log));
    }

    @Override
    @Transactional
    public AttendanceLogResponse checkOut(UUID id, Map<String, Object> checkOutLocation) {
        AttendanceLog log = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AttendanceLog", "id", id));

        if (log.getStatus() != AttendanceStatus.OPEN) {
            throw new BadRequestException("Phiên chấm công này đã được Check-out hoặc đã đóng");
        }

        OffsetDateTime checkOutTime = OffsetDateTime.now();
        log.setCheckOutAt(checkOutTime);
        log.setCheckOutLocation(checkOutLocation != null ? checkOutLocation : Map.of());

        // Tính thời lượng làm việc (giờ)
        Duration duration = Duration.between(log.getCheckInAt(), checkOutTime);
        double hours = (double) duration.toMinutes() / 60.0;
        BigDecimal calculatedHours = BigDecimal.valueOf(hours).setScale(2, RoundingMode.HALF_UP);
        log.setDurationHours(calculatedHours);

        log.setStatus(AttendanceStatus.PENDING_CONFIRMATION);
        return mapToResponse(attendanceRepository.save(log));
    }

    @Override
    @Transactional
    public AttendanceLogResponse confirmAttendance(UUID id, UUID mentorUserId, AttendanceStatus status) {
        AttendanceLog log = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AttendanceLog", "id", id));

        User mentor = userRepository.findById(mentorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorUserId));

        log.setStatus(status);
        log.setConfirmedBy(mentor);
        log.setConfirmedAt(OffsetDateTime.now());

        AttendanceLog saved = attendanceRepository.save(log);

        // Nếu Mentor xác nhận CONFIRMED, tự động cộng dồn số giờ vào Placement
        if (status == AttendanceStatus.CONFIRMED && log.getDurationHours() != null) {
            InternshipPlacement placement = log.getPlacement();
            BigDecimal currentTotal = placement.getTotalHoursWorked() != null ? placement.getTotalHoursWorked() : BigDecimal.ZERO;
            placement.setTotalHoursWorked(currentTotal.add(log.getDurationHours()));
            placementRepository.save(placement);
        }

        return mapToResponse(saved);
    }

    private AttendanceLogResponse mapToResponse(AttendanceLog entity) {
        return AttendanceLogResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .workDate(entity.getWorkDate())
            .checkInAt(entity.getCheckInAt())
            .checkOutAt(entity.getCheckOutAt())
            .durationHours(entity.getDurationHours())
            .workFormat(entity.getWorkFormat())
            .checkInLocation(entity.getCheckInLocation())
            .checkOutLocation(entity.getCheckOutLocation())
            .status(entity.getStatus())
            .confirmedByUserId(entity.getConfirmedBy() != null ? entity.getConfirmedBy().getId() : null)
            .confirmedAt(entity.getConfirmedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}