package com.internlink.core.presentation.placement.dto.response;

import com.internlink.core.shared.enums.AttendanceStatus;
import com.internlink.core.shared.enums.WorkFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLogResponse {

    private UUID id;
    private UUID placementId;
    private LocalDate workDate;
    private OffsetDateTime checkInAt;
    private OffsetDateTime checkOutAt;
    private BigDecimal durationHours;
    private WorkFormat workFormat;
    private Map<String, Object> checkInLocation;
    private Map<String, Object> checkOutLocation;
    private AttendanceStatus status;
    private UUID confirmedByUserId;
    private OffsetDateTime confirmedAt;
    private OffsetDateTime createdAt;
}