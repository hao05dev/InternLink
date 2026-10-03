package com.internlink.core.presentation.ai_matching.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CvExtractionRequest(
    UUID documentId,
    @Size(max = 100000) String text,
    @AssertTrue(message = "Cần đồng ý phân tích tài liệu trước khi tiếp tục") boolean consent,
    boolean allowCloud
) {}
