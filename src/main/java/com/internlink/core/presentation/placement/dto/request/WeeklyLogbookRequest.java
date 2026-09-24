package com.internlink.core.presentation.placement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLogbookRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @NotNull(message = "Tuần số không được để trống")
    @Min(1)
    private Integer weekNumber;

    @NotNull(message = "Ngày đầu tuần không được để trống")
    private LocalDate periodStart;

    @NotNull(message = "Ngày cuối tuần không được để trống")
    private LocalDate periodEnd;

    @NotBlank(message = "Công việc đã làm không được để trống")
    private String tasksCompleted;

    @NotBlank(message = "Bài học và tự nhận xét không được để trống")
    private String learningReflection;

    @NotNull(message = "Tổng số giờ làm việc trong tuần không được để trống")
    private BigDecimal totalHours;
}