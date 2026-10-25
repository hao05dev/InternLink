package com.internlink.core.application.organization;

import com.internlink.core.presentation.organization.dto.request.CreateLecturerRequest;
import com.internlink.core.presentation.organization.dto.request.LecturerImportItem;
import com.internlink.core.presentation.organization.dto.response.BatchLecturerImportResponse;
import com.internlink.core.presentation.organization.dto.response.FacultyLecturerResponse;

import java.util.List;
import java.util.UUID;

public interface FacultyLecturerManagementService {
    List<FacultyLecturerResponse> getLecturers(UUID departmentId, UUID termId);
    FacultyLecturerResponse createLecturer(UUID departmentId, UUID termId, CreateLecturerRequest request, UUID actorId);
    BatchLecturerImportResponse importLecturers(UUID departmentId, UUID termId, List<LecturerImportItem> items, UUID actorId);
}
