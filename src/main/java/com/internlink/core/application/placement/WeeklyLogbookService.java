package com.internlink.core.application.placement;

import com.internlink.core.presentation.placement.dto.request.WeeklyLogbookRequest;
import com.internlink.core.presentation.placement.dto.response.WeeklyLogbookResponse;
import com.internlink.core.shared.enums.LogbookStatus;

import java.util.List;
import java.util.UUID;

public interface WeeklyLogbookService {
    List<WeeklyLogbookResponse> getLogbooksByPlacement(UUID placementId);
    WeeklyLogbookResponse getLogbookById(UUID id);
    WeeklyLogbookResponse submitLogbook(UUID studentId, WeeklyLogbookRequest request);
    WeeklyLogbookResponse reviewByMentor(UUID id, UUID mentorUserId, LogbookStatus status, String mentorFeedback);
    WeeklyLogbookResponse commentByLecturer(UUID id, UUID lecturerUserId, String lecturerComment);
    WeeklyLogbookResponse reviewByLecturer(UUID id, UUID lecturerUserId, LogbookStatus status, String feedback);
}
