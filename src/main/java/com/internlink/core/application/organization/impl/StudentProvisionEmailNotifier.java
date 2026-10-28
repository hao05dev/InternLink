package com.internlink.core.application.organization.impl;

import com.internlink.core.application.system.notification.EmailOutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Soạn và đưa thư kích hoạt tài khoản sinh viên vào email outbox.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StudentProvisionEmailNotifier {

    private final EmailOutboxService emailOutboxService;

    public void sendProvisionEmail(
            String studentEmail,
            String studentName,
            String studentCode,
            String activationUrl,
            long ttlHours,
            String termName) {
        String subject = "[InternLink] Kích hoạt tài khoản Cổng thực tập tốt nghiệp - " + termName;
        String body = String.format(
                """
                Xin chào %s (MSSV: %s),

                Khoa đã xác nhận và kích hoạt tài khoản của bạn trên Cổng thông tin Thực tập tốt nghiệp InternLink cho học kỳ %s.

                Tài khoản của bạn: %s

                Vui lòng mở liên kết một lần dưới đây để tự đặt mật khẩu. Liên kết có hiệu lực trong %d giờ:
                %s

                LƯU Ý QUAN TRỌNG:
                1. Không chuyển tiếp liên kết kích hoạt cho người khác.
                2. Liên kết chỉ sử dụng được một lần. Nếu hết hạn, dùng chức năng Quên mật khẩu.
                3. Sau khi kích hoạt, vui lòng kiểm tra thông tin Giảng viên hướng dẫn được phân công.

                Trân trọng,
                Ban Quản lý Thực tập Khoa / Trường CNTT-TT
                """,
                studentName, studentCode, termName, studentEmail, ttlHours, activationUrl
        );

        boolean enqueued = emailOutboxService.enqueueNotice(studentEmail, subject, body);
        if (enqueued) {
            log.info("Đã đưa email kích hoạt cho sinh viên {} ({}) vào hàng đợi email.", studentCode, studentEmail);
        } else {
            log.warn("Không thể đưa email kích hoạt cho sinh viên {} ({}) vào hàng đợi (email có thể bị vô hiệu hóa hoặc trùng lặp).", studentCode, studentEmail);
        }
    }
}
