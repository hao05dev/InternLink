package com.internlink.core.application.organization.impl;

import com.internlink.core.application.system.notification.EmailOutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class LecturerProvisionEmailNotifier {

    private final EmailOutboxService emailOutboxService;

    public void sendProvisionEmail(
            String email,
            String fullName,
            String activationUrl,
            long ttlHours,
            String termName) {
        String subject = "[InternLink] Phân công tài khoản Giảng viên hướng dẫn - " + (termName != null ? termName : "Hệ thống Thực tập");
        String body = String.format(
                """
                Kính gửi Thầy/Cô %s,

                Ban Quản lý Thực tập Khoa đã thêm Thầy/Cô vào danh sách Giảng viên hướng dẫn học phần thực tập tốt nghiệp (%s).

                Tài khoản hệ thống InternLink: %s

                Vui lòng mở liên kết một lần dưới đây để tự đặt mật khẩu. Liên kết có hiệu lực trong %d giờ:
                %s

                LƯU Ý BẢO MẬT:
                - Không chuyển tiếp liên kết kích hoạt cho người khác.
                - Liên kết chỉ dùng được một lần. Nếu hết hạn, dùng chức năng Quên mật khẩu.
                - Sau khi đăng nhập, Thầy/Cô có thể theo dõi danh sách sinh viên được phân công hướng dẫn và quản lý nhật ký thực tập.

                Trân trọng,
                Ban Quản lý Thực tập Khoa
                """,
                fullName,
                termName != null ? termName : "Học kỳ hiện tại",
                email,
                ttlHours,
                activationUrl
        );

        emailOutboxService.enqueueNotice(email, subject, body);
    }
}
