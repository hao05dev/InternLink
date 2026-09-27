package com.internlink.core.presentation.placement.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record StudentFoundRequest(@NotNull UUID termId, @NotBlank String hostName,
    @NotBlank String hostAddress, @NotBlank String contactName, @NotBlank @Email String contactEmail,
    @NotBlank String workDescription, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {}
