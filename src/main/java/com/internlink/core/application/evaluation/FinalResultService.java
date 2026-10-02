package com.internlink.core.application.evaluation;

import com.internlink.core.presentation.evaluation.dto.request.BatchPublishResultRequest;
import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.BatchPublishResultResponse;
import com.internlink.core.presentation.evaluation.dto.response.FacultyEvaluationSummaryResponse;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;

import java.util.List;
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

    /**
     * Lấy danh sách tổng hợp đánh giá và điểm số thực tập của tất cả sinh viên trong một kỳ (dành cho Quản lý Khoa).
     *
     * @param termId         ID kỳ thực tập
     * @param facultyAdminId ID người dùng Quản lý Khoa
     * @return Danh sách tổng hợp điểm và đánh giá
     */
    List<FacultyEvaluationSummaryResponse> getTermEvaluationSummary(UUID termId, UUID facultyAdminId);

    /**
     * Công bố điểm hàng loạt cho các sinh viên trong kỳ.
     *
     * @param termId         ID kỳ thực tập
     * @param request        Yêu cầu công bố (chứa danh sách placementIds hoặc rỗng để công bố tất cả)
     * @param facultyAdminId ID người dùng Quản lý Khoa
     * @return Kết quả công bố hàng loạt
     */
    BatchPublishResultResponse publishBatchResults(UUID termId, BatchPublishResultRequest request, UUID facultyAdminId);

    /**
     * Tự động tổng hợp điểm nhanh cho một lần thực tập từ các phiếu đánh giá hiện có.
     *
     * @param placementId    ID lần thực tập
     * @param facultyAdminId ID người dùng Quản lý Khoa
     * @return Kết quả đánh giá sau khi tổng hợp
     */
    FinalResultResponse quickFinalizePlacement(UUID placementId, UUID facultyAdminId);
}