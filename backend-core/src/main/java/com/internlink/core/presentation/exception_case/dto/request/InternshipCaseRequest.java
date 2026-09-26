package com.internlink.core.presentation.exception_case.dto.request;

import com.internlink.core.shared.enums.CaseSeverity;
import com.internlink.core.shared.enums.CaseType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternshipCaseRequest {

    @NotNull(message = "Lần thực tập không được để trống")
    private UUID placementId;

    @NotNull(message = "Loại sự cố không được để trống")
    private CaseType caseType;

    @Builder.Default
    private CaseSeverity severity = CaseSeverity.NORMAL;

    @NotBlank(message = "Tóm tắt sự cố không được để trống")
    private String summary;

    @Builder.Default
    private Map<String, Object> detail = Map.of();

    private String relatedEntityType;
    private UUID relatedEntityId;
}