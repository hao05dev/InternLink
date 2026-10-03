# InternLink — Trạng thái triển khai thông báo / Gmail / R2
Cập nhật: 03/10/2026.

## Đã triển khai
- Inbox, bộ lọc chưa đọc, phân trang và tùy chọn email tại cả 6 portal; menu và chuông liên kết đến inbox.
- Thêm hook thông báo cho đăng ký/thẩm định doanh nghiệp, gửi duyệt tin và vòng đời đơn ứng tuyển. Các hook thực tập hiện có dùng email outbox chung.
- NotificationPreferenceService gắn owner với principal; email announcement cần opt-in.
- Outbox PostgreSQL, chống trùng theo khóa, claim có khóa/lease, gửi ngoài giao dịch, kiểm tra lại người nhận/prefs, retry có giới hạn; UNKNOWN không tự gửi lại.
- Gmail cá nhân qua SMTP STARTTLS/App Password, hoặc Workspace Gmail API với gmail.send/domain-wide delegation. Mặc định EMAIL_ENABLED=false.
- Chuyển các lệnh gửi email roster từ gửi trực tiếp sang xếp hàng; DTO/UI phân biệt emailsQueued và emailsSent.
- R2StorageService và cấu hình AWS S3 SDK, private object, key UUID, SHA-256, giới hạn 20 MiB, download qua quyền tài liệu hiện có.
- Bù trừ object khi giao dịch upload rollback; cấu hình mẫu backend-core/.env.example.
- Flyway V17 tạo notification_preferences/email_outbox. Giữ các migration đã phát hành.
- Bổ sung ngoại lệ .gitignore cho migration và mã Java trong thư mục storage để tránh thiếu file khi commit.

## Kết quả kiểm tra
| Kiểm tra | Kết quả |
|---|---|
| Maven toàn bộ backend trước đợt bổ sung 4 ca kiểm thử cuối | Thành công, exit 0 |
| Maven chạy lại phần thông báo/email/R2 và EvaluationAndSystemServiceTest sau thay đổi cuối | Thành công, exit 0; 49 ca |
| Tổng hợp Surefire của các lớp hiện tại | 152 ca, 0 lỗi, 0 thất bại, 0 bỏ qua trong môi trường kiểm tra có PostgreSQL |
| PostgreSQL 17 riêng, port 55439 | V1–V17 áp dụng thành công; Hibernate validate và JPA/native outbox cùng giao dịch |
| Vitest inbox + chuông | 13 ca thành công |
| TypeScript tsc --noEmit | Thành công |
| React Doctor, 3 file chức năng thông báo | Không có error; còn 2 cảnh báo heuristic đã xem ngữ cảnh |
| git diff --check cho phạm vi thông báo/config | Thành công |

React Doctor còn cảnh báo:
- Loading reset outside finally ở chuông: setLoading(false) nằm trong finally, được kiểm tra requestVersion để request cũ không reset trạng thái request mới.
- preventDefault ở form tùy chọn: chủ động ngăn trình duyệt submit/reload; dữ liệu lưu qua mutation, có hiển thị lỗi và trạng thái pending.

Không thay đổi quy tắc để tắt/suppress những cảnh báo này. Các cảnh báo khác ở frontend có thay đổi sẵn ngoài phạm vi được giữ nguyên.

Các test PostgreSQL chỉ chạy khi đặt INTERNLINK_TEST_PG_URL; Maven thông thường sẽ bỏ qua 12 ca cần PostgreSQL. Test tạo schema riêng, không dùng DB thực của người dùng. PostgreSQL tạm dùng để kiểm tra trong phiên làm việc đã được dừng sau khi chạy xong.

## Chưa xác nhận trên hạ tầng thật
- Chưa gửi thư thật qua Gmail hoặc upload/download bucket R2 thật.
- Chưa chạy V17 trên DB vận hành.
- Chưa có thông tin tài khoản Gmail/Workspace, bucket/token R2 hoặc lưu lượng email thực tế.
- Nhắc hạn tự động, campaign có giao dịch mỗi người, màn hình gửi lại/đối soát, quota theo ngày, SSE và presigned upload là phần kế hoạch tiếp theo; không được đánh dấu đã hoàn thành.

Xem NOTIFICATIONS_EMAIL_R2_PLAN.md để có ma trận vai trò, kiến trúc, hướng dẫn cấu hình, tiêu chí nghiệm thu và nguồn tài liệu chính thức.
