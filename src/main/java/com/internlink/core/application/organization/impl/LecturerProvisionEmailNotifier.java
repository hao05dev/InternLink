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

    public void sendProvisionEmail(String email, String fullName, String rawPassword, String termName) {
        String subject = "[InternLink] Phân công tài khoản Giảng viên hướng dẫn - " + (termName != null ? termName : "Hệ thống Thực tập");
        String body = String.format(
                """
                Kính gửi Thầy/Cô %s,

                Ban Quản lý Thực tập Khoa đã thêm Thầy/Cô vào danh sách Giảng viên hướng dẫn học phần thực tập tốt nghiệp (%s).

                Thông tin đăng nhập hệ thống InternLink:
                - Tài khoản (Email): %s
                - Mật khẩu tạm thời: %s

                LƯU Ý BẢO MẬT:
                - Vui lòng đổi mật khẩu mới trong lần đăng nhập đầu tiên.
                - Sau khi đăng nhập, Thầy/Cô có thể theo dõi danh sách sinh viên được phân công hướng dẫn và quản lý nhật ký thực tập.

                Trân trọng,
                Ban Quản lý Thực tập Khoa
                """,
                fullName, termName != null ? termName : "Học kỳ hiện tại", email, rawPassword
        );

        emailOutboxService.enqueueNotice(email, subject, body);
    }
}
