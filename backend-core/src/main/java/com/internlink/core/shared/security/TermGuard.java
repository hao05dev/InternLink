package com.internlink.core.shared.security;

import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.shared.enums.TermStatus;
import com.internlink.core.shared.exception.BadRequestException;

import java.util.Arrays;

/**
 * Kiểm soát nghiệp vụ liên quan đến trạng thái của Học kỳ thực tập (InternshipTerm).
 * Đảm bảo các học kỳ đã đóng (CLOSED) luôn ở chế độ Chỉ đọc (Read-only / Locked).
 */
public final class TermGuard {

    private TermGuard() {}

    /**
     * Yêu cầu học kỳ không được ở trạng thái CLOSED.
     *
     * @param term Học kỳ thực tập cần kiểm tra
     * @throws BadRequestException nếu học kỳ đã đóng
     */
    public static void requireNotClosed(InternshipTerm term) {
        if (term != null && term.getStatus() == TermStatus.CLOSED) {
            String termName = term.getTermName() != null ? term.getTermName() : "";
            String termCode = term.getCode() != null ? term.getCode() : "";
            throw new BadRequestException(
                String.format("Học kỳ thực tập '%s' (%s) đã kết thúc (CLOSED). Không thể thực hiện thao tác này.",
                    termName, termCode)
            );
        }
    }

    /**
     * Yêu cầu học kỳ phải ở trong danh sách các trạng thái cho phép.
     *
     * @param term Học kỳ thực tập cần kiểm tra
     * @param allowedStatuses Các trạng thái hợp lệ
     * @throws BadRequestException nếu trạng thái hiện tại không hợp lệ
     */
    public static void requireStatus(InternshipTerm term, TermStatus... allowedStatuses) {
        if (term == null) return;
        boolean matched = Arrays.stream(allowedStatuses).anyMatch(s -> s == term.getStatus());
        if (!matched) {
            throw new BadRequestException(
                String.format("Học kỳ thực tập đang ở trạng thái %s, không hỗ trợ thao tác này.", term.getStatus())
            );
        }
    }
}
