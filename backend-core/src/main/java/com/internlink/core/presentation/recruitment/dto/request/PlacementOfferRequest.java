package com.internlink.core.presentation.recruitment.dto.request;

import jakarta.validation.constraints.NotNull;
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
public class PlacementOfferRequest {

    @NotNull(message = "Hồ sơ ứng tuyển không được để trống")
    private UUID applicationId;

    @NotNull(message = "Cần chỉ định người hướng dẫn doanh nghiệp trước khi phát hành offer")
    private UUID proposedMentorId;

    @NotNull(message = "Ngày bắt đầu thực tập không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc thực tập không được để trống")
    private LocalDate endDate;

    private BigDecimal stipend;

    @Builder.Default
    private Map<String, Object> termsSnapshot = Map.of();

    @NotNull(message = "Thời hạn phản hồi Offer không được để trống")
    private OffsetDateTime expiresAt;
}
