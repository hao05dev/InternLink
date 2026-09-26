package com.internlink.core.application.evaluation;

import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;

import java.util.UUID;

public interface FinalResultService {

    /**
     * Xem kết quả đánh giá cuối kỳ theo lần thực tập có kiểm tra quyền.
     * Sinh viên chỉ được xem khi kết quả đã được công bố chính thức (publishedAt != null).
     *
     * @param placementId      ID lần thực tập
     * @param requestingUserId ID người dùng đang truy cập
     * @return Kết quả đánh giá
     */
    FinalResultResponse getFinalResultByPlacement(UUID placementId, UUID requestingUserId);

    /** Xem kết quả đánh giá nội bộ (không kiểm tra quyền sinh viên). */
    FinalResultResponse getFinalResultByPlacement(UUID placementId);

    /**
     * Tính toán và tổng hợp kết quả (hỗ trợ tự động tổng hợp từ phiếu Rubric đã nộp,
     * quy đổi thang điểm Đại học Cần Thơ, lưu nháp hoặc công bố).
     *
     * @param decidedByUserId ID người thực hiện tổng hợp
     * @param request         Dữ liệu yêu cầu
     * @return Kết quả sau khi tính toán
     */
    FinalResultResponse calculateAndFinalizeResult(UUID decidedByUserId, FinalResultRequest request);

    /**
     * Công bố chính thức kết quả thực tập cho sinh viên.
     * Cập nhật đợt thực tập sang COMPLETED nếu sinh viên đạt (PASSED).
     *
     * @param placementId       ID lần thực tập
     * @param publishedByUserId ID người công bố
     * @return Kết quả sau khi công bố
     */
    FinalResultResponse publishFinalResult(UUID placementId, UUID publishedByUserId);
}