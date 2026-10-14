package com.internlink.core.application.portfolio;

import com.internlink.core.domain.placement.DailyJournal;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.security.TermGuard;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public final class DailyJournalValidation {

    private static final Set<String> VALID_ATTENDANCE = Set.of("PRESENT", "REMOTE", "LEAVE", "ABSENT", "DAY_OFF");
    private static final Set<String> WORKING_ATTENDANCE = Set.of("PRESENT", "REMOTE");
    private static final Set<String> EDITABLE_STATUSES = Set.of("DRAFT", "REVISION_REQUIRED");

    private DailyJournalValidation() {}

    public static void checkActiveAndTerm(InternshipPlacement placement) {
        TermGuard.requireNotClosed(placement.getTerm());
        if (placement.getStatus() != PlacementStatus.ACTIVE) {
            throw new BadRequestException("Chỉ cập nhật khi kỳ thực tập đang hoạt động");
        }
    }

    public static void checkVersion(Integer actual, Integer expected) {
        if (!Objects.equals(actual, expected)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Dữ liệu đã thay đổi. Hãy tải lại trước khi lưu để tránh ghi đè.");
        }
    }

    public static void checkDate(InternshipPlacement placement, LocalDate date) {
        if (date.isBefore(placement.getStartDate())
                || date.isAfter(placement.getEndDate())
                || date.isAfter(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))) {
            throw new BadRequestException("Ngày nhật ký phải thuộc kỳ thực tập và không ở tương lai");
        }
    }

    public static void checkEditableStatus(String currentStatus) {
        if (!EDITABLE_STATUSES.contains(currentStatus)) {
            throw new BadRequestException("Nhật ký đã gửi; người xác nhận cần yêu cầu sửa trước khi cập nhật");
        }
    }

    public static BigDecimal calculateHours(DailyJournalService.Input in) {
        if (!VALID_ATTENDANCE.contains(in.attendance())) {
            throw new BadRequestException("Tình trạng tham gia không hợp lệ");
        }
        if (!WORKING_ATTENDANCE.contains(in.attendance())) {
            return BigDecimal.ZERO;
        }
        if (in.startTime() == null || in.endTime() == null || !in.endTime().isAfter(in.startTime())) {
            throw new BadRequestException("Nhập giờ bắt đầu và kết thúc hợp lệ trong ngày");
        }
        long minutes = Duration.between(in.startTime(), in.endTime()).toMinutes() - in.breakMinutes();
        if (minutes <= 0 || in.sessions() < 1) {
            throw new BadRequestException("Số buổi và thời gian làm việc phải lớn hơn 0");
        }
        return BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    public static void validateContentOnSubmit(DailyJournalService.Input in, String tasks, String results, String reflection) {
        boolean working = WORKING_ATTENDANCE.contains(in.attendance());
        if (in.submit() && working && (RichText.text(tasks).isBlank() || RichText.text(results).isBlank())) {
            throw new BadRequestException("Cần ghi công việc đã làm và kết quả trong ngày");
        }
        if (in.submit() && !working && RichText.text(reflection).isBlank()) {
            throw new BadRequestException("Ghi lý do nghỉ/vắng trong phần khó khăn và ghi chú");
        }
    }

    public static void validateReview(DailyJournal journal, DailyJournalService.Review in) {
        if (!Set.of("CONFIRMED", "REVISION_REQUIRED").contains(in.decision())
                || !("SUBMITTED".equals(journal.getStatus())
                        || ("CONFIRMED".equals(journal.getStatus()) && "REVISION_REQUIRED".equals(in.decision())))) {
            throw new BadRequestException("Trạng thái xác nhận không hợp lệ");
        }
        if ("REVISION_REQUIRED".equals(in.decision()) && (in.note() == null || in.note().isBlank())) {
            throw new BadRequestException("Cần ghi nội dung yêu cầu bổ sung");
        }
    }
}
