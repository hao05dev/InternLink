package com.internlink.core.presentation.placement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateIntroductionLetterRequest(
        @NotNull(message = "termId không được để trống")
        UUID termId,

        @NotBlank(message = "Tên cơ quan/doanh nghiệp dự kiến không được để trống")
        String targetCompanyName,

        String targetPosition,

        String reason
) {}
