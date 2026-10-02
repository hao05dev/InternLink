package com.internlink.core.presentation.organization.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IneligibleNoticeRequest {
    private String emailSubjectTemplate;
    private String emailBodyTemplate;
    private String supplementDeadline;
    private String contactInfo;
}
