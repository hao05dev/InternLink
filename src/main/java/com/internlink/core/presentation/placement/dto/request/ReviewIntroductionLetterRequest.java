package com.internlink.core.presentation.placement.dto.request;

import com.internlink.core.shared.enums.IntroductionLetterStatus;
import jakarta.validation.constraints.NotNull;

public record ReviewIntroductionLetterRequest(
        @NotNull(message = "Trạng thái phê duyệt không được để trống")
        IntroductionLetterStatus status,

        String issuedCode,

        String issueNote
) {}
