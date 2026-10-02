package com.internlink.core.presentation.organization.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IneligibleNoticeResponse {
    private int totalIneligible;
    private int emailsSent;
    private int notificationsCreated;
    private List<String> failedStudentCodes;
}
