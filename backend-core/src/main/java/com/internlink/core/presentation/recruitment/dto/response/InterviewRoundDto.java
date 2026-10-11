package com.internlink.core.presentation.recruitment.dto.response;

import com.internlink.core.shared.enums.InterviewFormat;
import com.internlink.core.shared.enums.InterviewRoundResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRoundDto {

    private Integer roundNumber;
    private InterviewFormat format;
    private OffsetDateTime scheduledAt;
    private String meetingUrl;
    private String location;
    private String interviewer;
    private String notes;
    private InterviewRoundResult result;
    private String feedback;
    private OffsetDateTime recordedAt;
}
