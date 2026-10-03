# Backend quản lý học phần thực tập CICT (chương trình đại trà)

## Phạm vi và dữ liệu cần nhập

Backend không có trọng số điểm mặc định. Cán bộ khoa nhập phương án đánh giá theo **kỳ thực tập + ngành + khóa + mã học phần + phiên bản** từ đề cương được phê duyệt. `sourceReference` phải ghi rõ nguồn đề cương/quyết định. Chỉ phương án `APPROVED` mới được gán cho một lần thực tập. Phương án đã gán được giữ nguyên khi khoa `RETIRED` phiên bản cũ và duyệt phiên bản mới cho các lần thực tập sau.

Danh sách sinh viên import vào kỳ cần `programId`, `academicYear` (khóa), `internshipCourseCode` và tình trạng đủ điều kiện. Mã học phần trong danh sách phải khớp phương án đánh giá mới gán được. Chương trình `track=CTCLC` nằm ngoài phạm vi phê duyệt phương án này.

Một thành phần đánh giá gồm `code`, `name`, `weight` (0–1), `assessorRole` (`COMPANY_MENTOR` hoặc `LECTURER`), `evidenceRequired` nếu cần, và tùy chọn `criteria` có mã/tên/trọng số riêng. Tổng trọng số thành phần và tổng trọng số tiêu chí của từng thành phần phải bằng 1. Backend tính điểm rubric từ các tiêu chí rồi làm tròn một chữ số thập phân; điểm học phần là tổng điểm thành phần nhân trọng số, làm tròn một chữ số thập phân trước khi đổi sang điểm chữ.

`requiredLogbookWeeks` phải lớn hơn 0 và `requireFinalReport=true`. Nếu báo cáo giữa kỳ được yêu cầu thì phải có hạn nộp. Báo cáo cuối kỳ luôn có hạn nộp. Nhật ký tuần có hạn theo ngày kết thúc tuần cộng `weeklyGraceDays`; nộp trễ được ghi `wasLate`, không tự trừ điểm khi đề cương chưa quy định.

## Hai luồng nơi thực tập

### Đối tác tham gia InternLink

Giữ luồng vị trí → ứng tuyển → offer → thỏa thuận → placement. Cán bộ gán phương án đánh giá trước khi chuyển placement sang `ACTIVE`. Mentor của đối tác chấm các thành phần được giao và duyệt nhật ký tuần. Giảng viên chấm thành phần của mình, duyệt báo cáo giữa/cuối kỳ.

### Sinh viên tự tìm nơi thực tập

Sinh viên tạo hồ sơ `/api/v1/student-found`, tải thư tiếp nhận vào `ContextType.SELF_FOUND` với `DocumentType.ACCEPTANCE_LETTER`, rồi nộp hồ sơ. Cán bộ khoa duyệt, từ chối hoặc yêu cầu sửa; khi duyệt phải phân công giảng viên. Hệ thống tạo placement `STUDENT_FOUND` không có offer, agreement, company hay tài khoản mentor. Sinh viên và giảng viên tiếp tục dùng nhật ký, báo cáo, tài liệu và kết quả điểm trong cùng hệ thống.

Giảng viên xét nhật ký bằng `/api/v1/logbooks/{id}/lecturer-review`. Phiếu chấm của người hướng dẫn tại nơi thực tập được tải lên placement với `DocumentType.EXTERNAL_EVALUATION`; giảng viên nhập điểm thành phần `source=OFFLINE` và xác minh phiếu. Đây là chứng từ ngoại tuyến, không phải thao tác của tài khoản doanh nghiệp. Hồ sơ bị từ chối/yêu cầu sửa có thể chỉnh sửa và nộp lại.

Nếu nhập sai phiếu chấm ngoại tuyến, giảng viên được gửi lại cùng mã thành phần khi điểm còn `PENDING_VERIFICATION`; bản chờ được cập nhật cùng minh chứng. Điểm đã `VERIFIED` cần hồ sơ phúc khảo và quyết định điều chỉnh riêng.

## Điều kiện chốt điểm

`POST /api/v1/final-results/finalize` chỉ nhận `placementId` và tùy chọn `publishImmediately`; các trường điểm/trọng số thủ công của API cũ bị từ chối. Backend chỉ tổng hợp khi:

1. Placement đang `ACTIVE` và đã gán phương án được duyệt.
2. Đủ các tuần nhật ký bắt buộc, đã được mentor hoặc giảng viên duyệt theo nguồn placement.
3. Các báo cáo bắt buộc được giảng viên duyệt, tệp vẫn hợp lệ.
4. Mọi điểm thành phần theo đề cương đều `VERIFIED`; phiếu ngoại tuyến có tài liệu còn hợp lệ.

Thiếu thành phần nào thì trả lỗi, không cho 0 hoặc chia lại trọng số. Bản nháp điểm không được công bố nếu phương án gán không khớp. Điểm đã công bố không thể tính lại qua API này; trường hợp phúc khảo dùng quy trình hồ sơ ngoại lệ hiện có và cần quyết định khoa trước khi sửa kết quả.

## API mới cho frontend

| Mục đích | Endpoint |
|---|---|
| Tạo, duyệt, thay thế phương án | `POST /api/v1/assessment-schemes`, `PATCH /{id}/approve`, `PATCH /{id}/retire` |
| Gán và xem phương án của placement | `PATCH /api/v1/assessment-schemes/placement/{placementId}/bind/{schemeId}`, `GET /api/v1/assessment-schemes/placement/{placementId}` |
| Hồ sơ tự tìm | `POST /api/v1/student-found`, `PUT /{id}`, `PATCH /{id}/submit`, `PATCH /{id}/review`, `GET /mine`, `GET /{id}` |
| Báo cáo giữa/cuối kỳ | `POST /api/v1/internship-reports/placement/{placementId}`, `PATCH /{id}/review`, `GET /placement/{placementId}` |
| Điểm thành phần | `POST /api/v1/component-scores`, `PATCH /{id}/verify`, `GET /placement/{placementId}` |

Các đường không ghi đủ tiền tố trong bảng dùng cùng tiền tố API ở đầu dòng. Frontend cần lấy phương án đã gán trước khi hiện form chấm và không tự gửi công thức tính điểm.

## Việc phải xác nhận bằng tài liệu CTU

Phải nhập đề cương có hiệu lực của từng học phần và khóa trước khi dùng tính điểm thật. Backend chỉ thực thi cấu hình đã duyệt; hiện chưa có trọng số chính thức cho các mã học phần `E` được tự động nạp vào cơ sở dữ liệu. Cần xác nhận thêm quy tắc xử lý nộp trễ, điểm tối thiểu thành phần và cách phúc khảo nếu CTU quy định riêng.
