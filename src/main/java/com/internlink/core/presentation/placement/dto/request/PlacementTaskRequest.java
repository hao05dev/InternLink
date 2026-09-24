package com.internlink.core.presentation.placement.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementTaskRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @NotBlank(message = "Tiêu đề công việc không được để trống")
    private String title;

    @NotBlank(message = "Mô tả công việc không được để trống")
    private String description;

    @Builder.Default
    private List<String> learningOutcomes = List.of();

    private OffsetDateTime dueAt;

    @Min(0)
    @Max(100)
    @Builder.Default
    private Integer progressPercent = 0;
}