# Quản lý AI dành cho admin

Đăng nhập vai trò `ADMIN`, chọn **Quản lý AI** trong menu hoặc truy cập `/admin/ai`.

- Thống kê tổng lượt, hoàn tất, thất bại và đang chờ/đang chạy.
- Kiểm tra kết nối dịch vụ AI, trạng thái cấu hình Gemini và tên mô hình.
- Tra cứu lịch sử theo sinh viên/email, vị trí, mô hình, trạng thái và nghiệp vụ; phân trang ở backend.
- Xem thông tin nguồn, thời gian, kết quả trích xuất và chi tiết lỗi.
- Tra cứu danh mục kỹ năng chuẩn, tên gọi khác, phiên bản và trạng thái.

## Xử lý lại CV lỗi

Mở chi tiết lượt `CV_EXTRACTION` có trạng thái `FAILED`, chọn **Xử lý lại CV**, nhập lại văn bản CV nguồn và gửi. Lịch sử chỉ lưu độ dài và hash đầu vào, không lưu toàn văn CV nên không có thao tác chạy lại tự động từ văn bản cũ.

Hệ thống tạo lượt AI mới liên kết lượt gốc và ghi nhật ký kiểm toán `AI_CV_RETRY`. Một lượt gốc chỉ tạo được một lượt xử lý lại; nếu lượt mới tiếp tục lỗi thì xử lý trên lượt mới. Khóa bản ghi ngăn hai yêu cầu đồng thời tạo hai lượt xử lý lại từ cùng lượt gốc.

Kỹ năng mới giữ trạng thái chưa xác nhận. Kỹ năng đã được sinh viên xác nhận hoặc khai báo từ nguồn khác không bị ghi đè. Dịch vụ AI lỗi sẽ tạo lượt `FAILED`, hiển thị lỗi và không thay đổi kỹ năng.

## API

Các endpoint dưới `/api/v1/admin/ai` yêu cầu `ADMIN` ở cả controller và service:

| Method | Path | Chức năng |
| --- | --- | --- |
| GET | `/stats` | Thống kê lịch sử |
| GET | `/health` | Kiểm tra dịch vụ AI |
| GET | `/runs?status=&type=&search=&page=0&size=20` | Lịch sử có bộ lọc; `page` bắt đầu từ 0, `size` tối đa 100 |
| GET | `/runs/{id}` | Chi tiết lượt chạy |
| POST | `/runs/{id}/retry` | Xử lý lại CV; body JSON `{"cvText":"..."}`; tối đa 100.000 ký tự |
| GET | `/taxonomy` | Tra cứu danh mục kỹ năng |

Hiện luồng nghiệp vụ ghi `ai_runs` cho trích xuất CV. Đối sánh/gợi ý việc làm chưa ghi lịch sử nên không xuất hiện trong thống kê. Danh mục kỹ năng trên trang này là chức năng tra cứu; chưa có thao tác sửa hoặc đồng bộ danh mục giữa Java và Python.

Sau khi cập nhật mã, khởi động lại backend và dịch vụ AI để nạp API và metadata mới. Frontend ở chế độ phát triển sẽ tự cập nhật.
