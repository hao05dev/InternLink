package com.internlink.core.presentation.placement.dto.request;

import com.internlink.core.shared.enums.WorkFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLogRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @NotNull(message = "Ngày làm việc không được để trống")
    private LocalDate workDate;

    @NotNull(message = "Thời gian Check-in không được để trống")
    private OffsetDateTime checkInAt;

    private OffsetDateTime checkOutAt;

    @Builder.Default
    private WorkFormat workFormat = WorkFormat.ONSITE;

    private Map<String, Object> checkInLocation;
    private Map<String, Object> checkOutLocation;
}