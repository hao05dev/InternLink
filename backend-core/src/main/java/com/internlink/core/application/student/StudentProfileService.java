package com.internlink.core.application.student;

import com.internlink.core.presentation.student.dto.request.StudentProfileRequest;
import com.internlink.core.presentation.student.dto.response.StudentProfileResponse;

import java.util.UUID;

public interface StudentProfileService {
    StudentProfileResponse getProfileByUserId(UUID userId);
    StudentProfileResponse createOrUpdateProfile(UUID userId, StudentProfileRequest request);
}
