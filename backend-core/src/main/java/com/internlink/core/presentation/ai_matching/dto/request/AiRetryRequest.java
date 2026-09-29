package com.internlink.core.presentation.ai_matching.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiRetryRequest(
    @NotBlank(message = "Vui lòng nhập lại nội dung CV nguồn")
    @Size(max = 100000, message = "Nội dung CV tối đa 100.000 ký tự") String cvText
) {}
