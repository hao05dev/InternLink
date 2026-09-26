package com.internlink.core.presentation.evaluation.dto.response;

import com.internlink.core.shared.enums.ResultStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalResultResponse {

    private UUID id;
    private UUID placementId;
    private String studentName;
    private String studentCode;
    private String companyName;
    private BigDecimal mentorScore;
    private BigDecimal lecturerScore;
    private BigDecimal complianceScore;
    private Map<String, Object> componentBreakdown;
    private BigDecimal finalScore;

    /** Điểm hệ 4 theo Quy chế đào tạo Đại học Cần Thơ (CTU) */
    private BigDecimal scoreScale4;

    /** Điểm chữ theo Quy chế đào tạo CTU (A, B+, B, C+, C, D+, D, F) */
    private String letterGrade;

    /** Xếp loại kết quả (Xuất sắc, Giỏi, Khá, Trung bình, Kém) */
    private String classification;

    private ResultStatus resultStatus;
    private UUID decidedByUserId;
    private String decidedByName;

    /** Cờ đánh dấu điểm đã được công bố chính thức cho sinh viên xem */
    private Boolean isPublished;

    private OffsetDateTime publishedAt;
    private OffsetDateTime finalizedAt;
    private OffsetDateTime createdAt;
}