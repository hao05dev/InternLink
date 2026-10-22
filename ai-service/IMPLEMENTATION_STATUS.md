# Tích hợp AI — bàn giao code ngày 03/10/2026

## Milestone chuẩn hóa bắt đầu ngày 20/10/2026

- Đã loại lexical hashing khỏi cấu hình inference online; provider chỉ còn dùng cho dữ liệu smoke offline với tên `local-hashing-baseline-v1`.
- Đã loại lựa chọn `ltr_ml` chưa có model artifact khỏi composition root. Weighted-feature chỉ còn là baseline offline và trả cảnh báo `offline_untrained_baseline`.
- Dataset 4 query do developer viết đã được đánh dấu `synthetic`, không còn ghi là benchmark học thuật có nhãn độc lập.
- Đã chuyển dependency test theo đường hỗ trợ hiện tại của Starlette sang `httpx2`. Contract HTTP vẫn cần chạy lại trong môi trường CI không bị giới hạn tiến trình/transport của sandbox hiện tại.
- Workflow và cổng nghiệm thu cho các milestone tiếp theo nằm tại [IMPLEMENTATION_WORKFLOW.html](IMPLEMENTATION_WORKFLOW.html).

## Milestone taxonomy bắt đầu ngày 20/10/2026

- Taxonomy `internlink-it-v2` có 51 kỹ năng; Python và migration V32 dùng cùng tập ID và có contract test chống lệch dữ liệu.
- Backend chỉ nhận kỹ năng đang active theo ID, tên chuẩn hoặc alias. Kỹ năng nhập tự do không còn được tự tạo với trạng thái active.
- Migration V32 đồng bộ version, bổ sung hai kỹ năng còn thiếu và vô hiệu hóa các bản ghi `CUSTOM` cũ để chờ rà soát.
- Form tin tuyển dụng chỉ thêm kỹ năng thuộc danh mục đã duyệt; nhập, dán hoặc chọn nhanh đều đi qua cùng bước kiểm tra.
- Migration vẫn cần được áp dụng và xác nhận trên cơ sở dữ liệu tích hợp trước khi đóng milestone.

## Milestone embedding và hybrid bắt đầu ngày 20/10/2026

- AI service có endpoint metadata và batch embedding; kết quả mang source hash, model revision, dimension, task và chunk policy.
- Gemini batch dùng một lời gọi cho các tài liệu cùng task; local E5 giữ tiền tố query/passage và không tự tải weights.
- Backend có migration V33 cho `embedding_records` bằng pgvector và cache theo toàn bộ provenance của vector.
- Luồng gợi ý chuẩn bị vector hồ sơ/JD ngoài ranker, tái sử dụng cache và tự hạ về skill-only khi provider hoặc cache không khả dụng.
- Hybrid response trả `effective_weights`, trạng thái thành phần và cảnh báo preference chưa được đánh giá; UI hiển thị trọng số thực dùng và lời giải thích.
- Chưa áp dụng V33 hoặc chạy với model weights/API thật trong lượt này; không tuyên bố đạt chất lượng hay latency production.

## Chức năng đã có code xuyên các lớp

| Chức năng | Hành vi hiện tại | Giới hạn |
|---|---|---|
| CV → kỹ năng | Sinh viên tải PDF/DOCX/TXT hoặc dán văn bản; đồng ý xử lý; xem trích dẫn; xác nhận hoặc tự khai kèm minh chứng | PDF scan trả yêu cầu OCR, chưa chạy OCR. Câu phủ định/đang học nhận diện bằng quy tắc, cần người rà soát |
| Gợi ý vị trí | Chỉ đọc kỹ năng đã xác nhận; batch tin APPROVED theo kỳ; giải thích kỹ năng khớp/thiếu; thiếu dữ liệu hiển thị riêng | Luồng web hiện chạy skill-only; chưa tích hợp cache embedding/preference/đủ điều kiện ứng tuyển vào ranking |
| Thống kê khoa | Trong kỳ thuộc khoa quản lý; đối chiếu nhu cầu tin APPROVED và kỹ năng sinh viên tự xác nhận | Chưa phản ánh năng lực thực. Ẩn nhóm nhỏ và ô thống kê có nhóm bù nhỏ; chưa có phân tích theo ngành/chuẩn đầu ra |
| Rà soát JD | Doanh nghiệp sở hữu hoặc khoa quản lý xem checklist và đề xuất kỹ năng bắt buộc/ưu tiên kèm câu nguồn | Nội dung bản nháp; sửa tin qua luồng quản lý tin hiện có, chưa có chấp nhận đề xuất bằng một nút |
| Nhật ký | Tổng hợp kỹ năng được đề cập trong nhật ký tuần đã nộp; giữ ID, hash nội dung, câu nguồn, trạng thái rà soát | Chưa dùng nhật ký ngày/portfolio mới; không tự đánh giá đạt chuẩn hoặc chấm điểm |
| Kế hoạch học | Đề xuất bài tập cho 1–3 kỹ năng, tổng thời gian theo ngân sách mỗi tuần | Mẫu quy tắc để trao đổi với mentor, chưa có học liệu được tuyển chọn hay theo dõi hoàn thành |

Các trang mới có mục **Hỗ trợ AI** trong menu: /student/ai, /company/ai, /faculty/ai, /lecturer/ai, /mentor/ai.

## Bảo toàn dữ liệu và hợp đồng

- CV chỉ được xử lý từ tài liệu ACTIVE, đúng loại CV và thuộc sinh viên hiện tại. Backend tự đọc tài liệu qua DocumentService đã kiểm tra quyền; không nhận URL tuỳ ý.
- Chỉ khi allowCloud=true và server bật provider, nội dung mới được gửi đến dịch vụ AI bên ngoài. Mặc định dùng quy tắc nội bộ.
- Lưu lượt trích xuất, hash nguồn, consent, phiên bản taxonomy/prompt và kết quả. Không lưu lại base64 trong input snapshot.
- Kỹ năng đã xác nhận hoặc tự khai không bị một lượt trích xuất mới ghi đè. Câu phủ định/ý định học không được xác nhận trực tiếp; sinh viên có thể tự khai với minh chứng mới.
- Các vai trò được xem kỹ năng sinh viên khác không nhận câu trích dẫn CV qua endpoint danh sách kỹ năng.
- Java fallback và Python cùng công thức 80% bắt buộc + 20% ưu tiên; khi chỉ có một nhóm thì dùng toàn bộ trọng số nhóm đó. Fixture dùng chung: tests/fixtures/ranking_contract.json.
- Metadata mode, scoreAvailable, semanticAvailable, algorithmVersion, warnings đi tới frontend.
- Phạm vi thống kê/JD được kiểm tra theo quan hệ khoa/doanh nghiệp; nhật ký dùng phân quyền hồ sơ thực tập hiện có.

## Cách chạy thử

1. Khởi động PostgreSQL và backend theo hướng dẫn hiện có. Migration V16 bổ sung ai_evidence/external_uri; V32 quản trị taxonomy v2; V33 tạo cache embedding pgvector. Các migration **chưa được áp dụng lên cơ sở dữ liệu trong lượt triển khai này**.
2. Trong ai-service, cài requirements-dev.txt (đã gồm requirements.txt). Dùng EXTRACTION_PROVIDER=rules, EMBEDDING_PROVIDER=disabled để chạy nội bộ.
3. Đặt SERVICE_API_KEY ở ai-service bằng AI_SERVICE_API_KEY ở backend khi triển khai hai dịch vụ. Giữ FastAPI trong mạng nội bộ. Giá trị trống chỉ dành cho phát triển local.
4. Chạy Python bằng `python -m uvicorn app.main:app --host 127.0.0.1 --port 8001`, backend và frontend như hướng dẫn dự án.
5. Đăng nhập sinh viên → Hỗ trợ AI → dán “Dự án Java. Chưa biết Docker.” → đồng ý → phân tích. Java cần bấm xác nhận; Docker không được xác nhận từ câu phủ định.
6. Chọn kỳ có tin đã duyệt và đã khai kỹ năng yêu cầu; kiểm tra điểm, thiếu minh chứng và trạng thái thiếu dữ liệu.
7. Đăng nhập doanh nghiệp/khoa/người hướng dẫn để kiểm tra các màn hình thuộc phạm vi tương ứng.

Nếu muốn dùng Gemini, cài requirements-gemini.txt và cấu hình model/key. Chưa gửi dữ liệu thật hoặc gọi model thật trong các kiểm thử này. Adapter local E5 đọc model đã có trên đĩa, không tự tải; cần requirements-local.txt, LOCAL_MODEL_PATH, LOCAL_MODEL_REVISION và dimension đúng model. Adapter chưa được chạy với weights thật.

## Đánh giá thực nghiệm

`python -m app.evaluation.runner datasets/synthetic_smoke.json --output evaluation-reports/synthetic_smoke.json`

Runner tính Jaccard, BM25 và Skill_Only từ dữ liệu đầu vào; chỉ thêm Dense/Hybrid khi có vector tương thích. Từng phương pháp ghi số query đã đo. Nếu số query khác nhau, phải so sánh trên tập chung trước khi kết luận. Nhãn phải đầy đủ cho tất cả ứng viên và mỗi query có ít nhất 5 ứng viên. File synthetic chỉ kiểm tra pipeline, không phải kết quả nghiên cứu hoặc nhãn chuyên gia.

## Việc tiếp theo trong kế hoạch nghiên cứu

1. Bộ dữ liệu được phép sử dụng, hướng dẫn chấm nhãn và nhãn chuyên gia; đánh giá tách development/validation/test.
2. Cache embedding theo hash/model/revision, luồng xử lý nền và đo model thực; bộ lọc ngành/địa điểm/hạn ứng tuyển, preference có phiên bản.
3. Duyệt đề xuất JD có lưu lịch sử, nhật ký ngày/portfolio có dẫn chứng, học liệu thật và theo dõi kế hoạch học.
4. Kiểm thử chạy toàn hệ thống với PostgreSQL và tài khoản theo vai trò; thử OCR, hàng đợi, giới hạn tần suất, retention/xoá dữ liệu trước vận hành với CV thật.

Chưa tuyên bố hoàn thành toàn bộ nghiên cứu, chất lượng mô hình hoặc sẵn sàng production chỉ dựa trên unit test.

## Kết quả kiểm tra của lượt triển khai

- Python: 30 ranking/embedding/provider/taxonomy tests đạt trong lượt mới nhất. Nhóm HTTP contract vẫn bị treo bởi ASGI transport trong sandbox và cần chạy lại ở CI.
- Backend: `mvn -DskipTests test-compile` đạt. Test Mockito chưa chạy được trong sandbox vì Java agent bị từ chối quyền truy cập.
- Frontend: 7/7 test taxonomy/form và 4/4 test AI workspace đạt khi chạy theo từng suite; TypeScript `--noEmit` đạt.
- Runner synthetic chạy thành công cho Jaccard/BM25/Skill_Only, không tạo kết quả Dense/Hybrid khi không có vector.
- React Doctor quét 5 tệp frontend thay đổi: điểm 90/100, không phát hiện vấn đề.
- Diff check trong các tệp AI thay đổi không báo lỗi whitespace.
- Chưa kiểm thử E2E trên DB/server đang chạy; chưa áp dụng migration, tải weights hoặc gọi dịch vụ mô hình thật.
