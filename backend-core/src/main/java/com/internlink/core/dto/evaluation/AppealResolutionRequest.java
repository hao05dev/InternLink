package com.internlink.core.dto.evaluation;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppealResolutionRequest {

    @NotBlank(message = "Trạng thái xử lý không được để trống (RESOLVED, REJECTED, IN_REVIEW)")
    private String status;

    @NotBlank(message = "Nội dung phản hồi giải quyết không được để trống")
    private String responseContent;
}
