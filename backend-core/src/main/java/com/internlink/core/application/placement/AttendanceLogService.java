package com.internlink.core.application.placement;

import com.internlink.core.presentation.placement.dto.request.AttendanceLogRequest;
import com.internlink.core.presentation.placement.dto.response.AttendanceLogResponse;
import com.internlink.core.shared.enums.AttendanceStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AttendanceLogService {
    List<AttendanceLogResponse> getAttendanceByPlacement(UUID placementId);
    AttendanceLogResponse getAttendanceById(UUID id);
    AttendanceLogResponse checkIn(AttendanceLogRequest request);
    AttendanceLogResponse checkOut(UUID id, Map<String, Object> checkOutLocation);
    AttendanceLogResponse confirmAttendance(UUID id, UUID mentorUserId, AttendanceStatus status);
}