package com.internlink.core.dto.recruitment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SendOfferRequest(
        @NotBlank(message = "Offer details are required") String offerDetails,

        @NotNull(message = "Offer deadline is required") LocalDateTime offerDeadline) {
}