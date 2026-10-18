package com.internlink.core.application.organization.impl;

import com.internlink.core.application.system.notification.EmailOutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Soạn và đưa thư kích hoạt tài khoản sinh viên kèm mật khẩu ngẫu nhiên vào hàng đợi email outbox.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StudentProvisionEmailNotifier {

    private final EmailOutboxService emailOutboxService;

    public void sendProvisionEmail(String studentEmail, String studentName, String studentCode, String rawPassword, String termName) {
        String subject = "[InternLink] Kích hoạt tài khoản Cổng thực tập tốt nghiệp - " + termName;
        String body = String.format(
                """
                Xin chào %s (MSSV: %s),

                Khoa đã xác nhận và kích hoạt tài khoản của bạn trên Cổng thông tin Thực tập tốt nghiệp InternLink cho học kỳ %s.

                Thông tin đăng nhập của bạn:
                - Tài khoản (Email): %s
                - Mật khẩu tạm thời: %s

                LƯU Ý QUAN TRỌNG:
                1. Đây là mật khẩu ngẫu nhiên bảo mật được hệ thống khởi tạo tự động.
                2. Để đảm bảo an toàn thông tin, hệ thống sẽ yêu cầu bạn ĐỔI MẬT KHẨU MỚI ngay trong lần đăng nhập đầu tiên.
                3. Sau khi đăng nhập, vui lòng kiểm tra thông tin Giảng viên hướng dẫn học phần được phân công.

                Trân trọng,
                Ban Quản lý Thực tập Khoa / Trường CNTT-TT
                """,
                studentName, studentCode, termName, studentEmail, rawPassword
        );

        boolean enqueued = emailOutboxService.enqueueNotice(studentEmail, subject, body);
        if (enqueued) {
            log.info("Đã đưa email kích hoạt cho sinh viên {} ({}) vào hàng đợi email.", studentCode, studentEmail);
        } else {
            log.warn("Không thể đưa email kích hoạt cho sinh viên {} ({}) vào hàng đợi (email có thể bị vô hiệu hóa hoặc trùng lặp).", studentCode, studentEmail);
        }
    }
}
