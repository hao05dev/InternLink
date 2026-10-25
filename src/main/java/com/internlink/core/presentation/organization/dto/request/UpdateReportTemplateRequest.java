package com.internlink.core.presentation.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateReportTemplateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String description;
    private String fileName;
    private String programCode;
    private Boolean isMandatory;
}
