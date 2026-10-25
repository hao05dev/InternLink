package com.internlink.core.application.placement;

import com.internlink.core.domain.auth.User;
import com.internlink.core.presentation.placement.dto.response.StudentDossierResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Quản lý tiến độ nộp và kiểm soát tính đầy đủ của bộ hồ sơ biểu mẫu thực tập cho sinh viên.
 */
public interface StudentDossierService {
    StudentDossierResponse getStudentDossier(User student);
    StudentDossierResponse uploadDossierDocument(UUID placementId, String templateCode, MultipartFile file, User student);
}
