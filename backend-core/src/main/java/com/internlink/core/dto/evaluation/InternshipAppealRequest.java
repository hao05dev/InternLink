package com.internlink.core.dto.evaluation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipAppealRequest {

    @NotNull(message = "ID thỏa thuận thực tập không được để trống")
    private Long learningAgreementId;

    @NotBlank(message = "Loại khiếu nại không được để trống (EVALUATION_SCORE, LOGBOOK_FEEDBACK, GENERAL)")
    private String appealType;

    @NotBlank(message = "Tiêu đề khiếu nại không được để trống")
    private String title;

    @NotBlank(message = "Nội dung khiếu nại không được để trống")
    private String content;

    private String evidenceUrl;
}
