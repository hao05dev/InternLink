# Hồ sơ thực tập, nhật ký ngày và biểu mẫu Word

## Truy cập theo vai trò

| Vai trò | Màn hình | Trách nhiệm |
| --- | --- | --- |
| Sinh viên | `/student/daily-logs`, `/student/internship-record`, `/student/final-report` | Ghi nhật ký hằng ngày, gửi tổng hợp tuần, viết và gửi M-TT-05, tải các phiếu được phép xem |
| Người hướng dẫn doanh nghiệp | `/mentor/internship-record`, `/mentor/weekly-evaluations`, `/mentor/final-assessment` | Giao việc M-TT-01, xác nhận nhật ký, nhận xét M-TT-02, đánh giá M-TT-03 |
| Giảng viên | `/lecturer/supervision`, `/lecturer/internship-record`, `/lecturer/grading` | Theo dõi, duyệt báo cáo, chấm M-TT-04; tiếp nhận phiếu gốc và xác nhận nhật ký khi nơi thực tập không có tài khoản người hướng dẫn |
| Quản lý khoa | `/faculty/internship-record` | Giám sát hồ sơ thuộc khoa, cho phép hoặc thu hồi công bố các phiếu đánh giá |

Mỗi trang hồ sơ có bốn phần: **Tổng quan → Nhật ký ngày → Tổng hợp tuần → Biểu mẫu & báo cáo**. Người dùng chọn sinh viên/kỳ thực tập được phân công ở đầu trang. Quyền được kiểm tra ở backend theo cả vai trò và quan hệ với lần thực tập.

## Quy trình

1. Người hướng dẫn lập M-TT-01 theo các tuần của lần thực tập. Các tuần là khoảng bảy ngày tính từ ngày bắt đầu; tuần cuối được cắt tại ngày kết thúc.
2. Sinh viên ghi tình trạng tham gia (có mặt, từ xa, nghỉ phép, vắng, ngày nghỉ), giờ bắt đầu/kết thúc, thời gian nghỉ, số buổi, công việc, kết quả, bài học và minh chứng. Ngày tương lai hoặc ngoài kỳ thực tập không được gửi.
3. Bản nháp tự lưu sau khi ngừng nhập khoảng 1,8 giây. Bản dự phòng trên trình duyệt được giữ tới khi máy chủ xác nhận. Có thể khôi phục khi quay lại trang nếu chưa đồng bộ; không nên dùng thiết bị chung để lưu thông tin nhạy cảm của doanh nghiệp.
4. Sinh viên gửi nhật ký; người hướng dẫn xác nhận hoặc yêu cầu bổ sung. Chỉ nhật ký đã xác nhận được cộng số buổi/giờ. Ngày chưa có nhật ký **không tự quy thành vắng**. Đây là xác nhận của người hướng dẫn, không phải hệ thống định vị/chấm công tự động.
5. Khi tuần kết thúc và các nhật ký đã ghi trong tuần đều được xác nhận, sinh viên gửi tổng hợp tuần vào quy trình nhật ký tuần hiện có. Tuần đã gửi/duyệt khóa sửa nhật ký ngày; cần yêu cầu sửa tuần trước.
6. M-TT-02 lấy công việc từ M-TT-01 và thời lượng từ nhật ký đã xác nhận. Người hướng dẫn ghi nhận xét chính thức theo tuần và hoàn thành phiếu. Nhận xét chính thức này khác với phản hồi sửa nhật ký mà sinh viên được đọc ngay.
7. Người hướng dẫn hoàn thành M-TT-03. Thực tập online bỏ ba tiêu chí I.1–I.3 theo mẫu; tổng tiêu chí áp dụng không tự quy đổi thành điểm học phần.
8. Sinh viên viết M-TT-05 theo từng mục, có thể chèn nội dung từ nhật ký đã xác nhận rồi biên tập. Gửi báo cáo tạo tài liệu Word và bản nộp FINAL trong quy trình báo cáo hiện có. Giảng viên duyệt hoặc yêu cầu chỉnh sửa; phiên bản nộp trước được lưu lại.
9. M-TT-03 và M-TT-04 hiển thị các thành phần/tiêu chí của phương án đánh giá đã duyệt. Hoàn thành phiếu ghi điểm vào `assessment_component_scores`, gắn phiên bản phiếu làm minh chứng riêng tư. Điểm đã xác minh không được thay đổi trực tiếp bằng cách mở lại phiếu. Không áp đặt tỷ trọng 40/60 hay rubric mẫu lên học phần khác.
10. Chủ thể phụ trách tải DOCX, ký bên ngoài hệ thống và lưu bản scan PDF/PNG/JPEG (tối đa 10 MB) gắn đúng phiên bản. Khoa quyết định công bố M-TT-02/03/04 cho sinh viên.

## Bảo mật và phiên bản

- Trước công bố, sinh viên chỉ nhận trạng thái hoàn thành của M-TT-02/03/04. Nội dung, điểm, góp ý, lịch sử nội bộ và bản ký không được trả qua API; đường tải DOCX/bản ký cũng trả 403.
- Sau công bố, sinh viên được xem phiên bản hiện hành. Các bản đánh giá cũ và ghi chú lịch sử nội bộ vẫn không được mở cho sinh viên. Thu hồi công bố chặn các lần tải sau; không thể thu hồi file mà người dùng đã tải về trước đó.
- M-TT-04 trong DOCX báo cáo của sinh viên luôn là phiếu có ô điểm trống. Không ghép điểm kín của giảng viên vào bản sinh viên tự xuất.
- Mỗi lần gửi, hoàn thành, duyệt, yêu cầu sửa, mở lại, công bố hoặc lưu bản ký đều có mốc lịch sử. DOCX đã chốt được lưu nguyên bản; tải lại không tạo lại bằng dữ liệu mới.
- Lưu và chuyển trạng thái kiểm tra `version`, trả 409 khi có xung đột. Các thao tác cùng lần thực tập được khóa ở cơ sở dữ liệu. Dữ liệu JSON được chuẩn hóa kiểu số để tránh tăng phiên bản giả khi Hibernate kiểm tra thay đổi.
- Nội dung rich text được làm sạch ở cả trình duyệt và backend. Ảnh được nhúng PNG/JPEG; máy chủ không tải ảnh từ URL tùy ý khi xuất Word.

## Soạn thảo và tài liệu

Frontend sử dụng Tiptap: đậm/nghiêng/gạch chân, căn lề, font, cỡ chữ, giãn dòng, danh sách, bảng, ảnh, chú thích hình và hoàn tác. `docx-preview` hiển thị bản xuất ngay trong ứng dụng. Backend dùng docx4j ImportXHTML để xuất Word có văn bản/bảng chỉnh sửa được.

Mẫu `CTU-2026-v1` tái dựng cấu trúc của bốn file tham khảo người dùng cung cấp; không mang dữ liệu cá nhân trong báo cáo mẫu sang hồ sơ mới. Đây không phải bản sao giữ nguyên mọi chi tiết đồ họa của file gốc. Các điểm chuẩn hóa:

- M-TT-01/02 tính số tuần từ thời gian thực tập, không cố định 12 tuần cho mọi hồ sơ.
- M-TT-03 giữ mười tiêu chí, các lựa chọn góp ý chương trình và vị trí chữ ký; nội dung ngắn được bố trí một trang, nhận xét dài có thể thêm trang.
- M-TT-04 dùng phương án đánh giá hiện hành thay cho tỷ trọng cứng trong tài liệu tham khảo.
- M-TT-05 mặc định khổ Letter như file tham khảo, có lựa chọn A4; font mặc định Times New Roman 13. Bìa, lời cảm ơn, phiếu chấm trống, mục lục, danh mục hình và bốn chương được ghép tự động. Chuẩn hóa chương kết quả thành chương IV.
- Bìa không đánh số, phần đầu dùng số La Mã, phần chương bắt đầu lại từ 1. Tiêu đề mục và chú thích hình tạo trường mục lục Word. Trong Word, cập nhật trường/mục lục khi mở để làm mới số trang; bản xem trước trên web không thay thế dàn trang của Word.
- Nơi thực tập không có tài khoản người hướng dẫn: giảng viên tiếp nhận bản ký gốc. Chỉ có scan thì chưa có dữ liệu số để tái tạo đầy đủ DOCX; tải bản ký gốc tại mục **Bản đã ký**.

## Triển khai

- Backend Java 21: chạy Maven như cấu hình dự án. Flyway tự áp dụng **V11** (nhật ký, biểu mẫu, lịch sử, bản ký) và **V12** (minh chứng điểm là phiên bản biểu mẫu). Cần khởi động lại backend sau khi cập nhật mã.
- Frontend: `npm ci`, sau đó `npm run dev` hoặc `npm run build` và `npm start`.
- API mới dưới `/api/v1/portfolio`; sử dụng phiên đăng nhập hiện có.
- Khoa cần gán phương án đánh giá đã duyệt cho lần thực tập để ghi điểm học phần/M-TT-04. Việc xuất phiếu không thay thế chữ ký hoặc con dấu thật.
- Bản DOCX đã chốt và scan ký được lưu trong PostgreSQL cùng quyền hồ sơ. Cần tính cả các bảng này trong sao lưu và dung lượng lưu trữ.

## Kiểm chứng

Đã chạy bộ kiểm thử backend/frontend, build production frontend và React Doctor. Các kiểm thử mới bao gồm quyền phiếu kín, người hướng dẫn sai phân công, giới hạn ngày, khóa tuần, tính giờ/buổi, phiên bản JSON, điểm theo rubric, cấu trúc Word và tự lưu đồng thời/khôi phục sau lỗi.

Đã thử API với database PostgreSQL riêng: áp dụng toàn bộ 12 migration, gửi/xác nhận nhật ký, gửi tuần, hoàn thành M01–M04, công bố/thu hồi, nộp báo cáo M05, yêu cầu sửa, gửi lại và duyệt. Đã mở tài liệu kiểm thử bằng Word, cập nhật trường và xuất PDF để kiểm tra bố cục. Đã kiểm tra giao diện nhật ký desktop/mobile, tự lưu và ẩn phiếu kín bằng trình duyệt.

Database và các file kiểm thử được tách khỏi dữ liệu ứng dụng. React Doctor không còn báo lỗi trong mã mới; các cảnh báo còn lại của toàn dự án cần được đánh giá riêng, không tự nâng cấp framework trong thay đổi này.
