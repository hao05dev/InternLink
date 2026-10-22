# InternLink AI Service

Dịch vụ FastAPI xử lý kỹ năng và đối sánh hồ sơ–vị trí. Spring Boot giữ dữ liệu nghiệp vụ, quyền truy cập, xác nhận kỹ năng và trạng thái thực tập; dịch vụ này trả kết quả có cấu trúc để backend sử dụng.

## Cấu trúc hiện tại

```text
ai-service/
├── app/
│   ├── main.py                  # create_app, lắp ghép router, xử lý lỗi
│   ├── core/                    # cấu hình, lỗi an toàn
│   ├── api/
│   │   ├── dependencies.py      # lắp ghép/inject các service và provider
│   │   └── v1/routes/           # HTTP: health, skills, matching, benchmark demo
│   ├── schemas/                # hợp đồng request/response và validation
│   ├── providers/              # giao diện provider và adapter Gemini SDK mới
│   ├── services/               # taxonomy, extraction, embedding, ranking, orchestration
│   ├── evaluation/             # metric và đánh giá điểm cho sẵn, tách khỏi inference
│   ├── prompts/                # prompt có phiên bản
│   ├── data/                   # taxonomy nội bộ v2 (51 mục)
│   ├── config.py               # import tương thích cho Settings
│   └── routers/                # chuyển tiếp router cũ sang api/v1/routes
├── tests/                      # contract, ranking, evidence, provider, metric
├── requirements.txt            # phần lõi chạy không cần cloud SDK
├── requirements-gemini.txt     # phần lõi + google-genai
├── requirements-dev.txt        # phần lõi + công cụ kiểm thử
├── pyproject.toml              # metadata, cấu hình pytest
├── .env.example
├── ARCHITECTURE.md
└── IMPLEMENTATION_PLAN.md
```

Quy tắc phụ thuộc: router chỉ gọi service; service dùng schema và giao diện provider; adapter mới gọi SDK. Các hàm ranking/metric không truy cập mạng hoặc cơ sở dữ liệu. Chỉ composition root khởi tạo dependency; không có singleton model/client dùng chung ở lúc import.

`local-hashing-baseline-v1` và weighted-feature baseline chỉ phục vụ smoke test/ablation offline. Chúng không phải semantic model hoặc Learning-to-Rank đã huấn luyện và không thể chọn làm thuật toán inference online.

## Chạy dịch vụ

Thực hiện trong thư mục ai-service, Python 3.10 trở lên:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Backend đang mặc định gọi cổng **8001**. Mở Swagger tại [API docs](http://127.0.0.1:8001/docs). Không ghi đè file .env đang có; đối chiếu các biến mới trong .env.example. Các biến DB cũ được bỏ qua vì dịch vụ này chưa sở hữu cơ sở dữ liệu.

Mặc định EXTRACTION_PROVIDER=rules và EMBEDDING_PROVIDER=disabled: chạy được không có API key. Có key trong .env không tự bật việc gửi CV ra ngoài. Để dùng Gemini, cài requirements-gemini.txt, chọn provider=gemini và đặt rõ LLM_MODEL / EMBEDDING_MODEL còn hoạt động; EMBEDDING_DIMENSION phải được model hỗ trợ. Không có model mặc định có thể âm thầm hết hạn.

Cấu hình khai báo provider chỉ chứng minh đã có cấu hình, không chứng minh nhà cung cấp đang hoạt động. Health không gọi dịch vụ ngoài; kết quả ghi provider_connectivity=not_probed. Trước rollout phải có kiểm tra thực tế bằng dữ liệu kiểm thử được phép sử dụng. Adapter hiện đã được kiểm thử bằng SDK giả lập, chưa xác minh qua API thật.

## Hợp đồng API

| Endpoint | Hành vi |
|---|---|
| GET / hoặc /health/live | Tình trạng process/cấu hình; giữ các trường Java đang đọc |
| GET /api/v1/skills/taxonomy | 51 mục nội bộ, version `internlink-it-v2` và nguồn; chưa coi là ánh xạ ESCO chính thức |
| POST /api/v1/skills/normalize | Chuẩn hóa danh sách tên; fuzzy chỉ với từ đủ dài, chưa có ESCO URI |
| POST /api/v1/skills/extract-document | Đọc PDF có text/DOCX/TXT, checksum nguồn; PDF scan trả ocr_required |
| POST /api/v1/assistance/job-review | Checklist bản nháp JD |
| POST /api/v1/assistance/journal-summary | Dẫn chứng kỹ năng gắn ID/hash nhật ký |
| POST /api/v1/assistance/learning-plan | Bài tập mẫu cho 1–3 kỹ năng |
| POST /api/v1/skills/extract | Trích xuất từ text, evidence quote/offset, yêu cầu người dùng xác nhận |
| POST /api/v1/matching/embedding | Tạo vector thật; 503 có mã lý do khi disabled/lỗi, không vector giả |
| GET /api/v1/matching/embedding/info | Metadata model/revision/dimension/chunk policy để backend tra cache an toàn |
| POST /api/v1/matching/embedding/batch | Chuẩn bị tối đa 128 vector theo batch, giữ source hash và thứ tự đầu vào |
| POST /api/v1/matching/rank-jobs | Tính điểm trên kỹ năng và vector đã chuẩn bị; không gọi cloud trong vòng lặp |
| GET /api/v1/benchmarks/run-sample-evaluation | Chỉ có khi ENABLE_SAMPLE_BENCHMARK=true; dữ liệu demo và điểm viết sẵn |

Request tối thiểu tương thích với payload Spring Boot:

```json
{
  "student": {"id": "s1", "skill_ids": ["SK-JAVA"], "bio_summary": "Dự án Java"},
  "jobs": [{
    "id": "j1",
    "title": "Java Intern",
    "mandatory_skill_ids": ["SK-JAVA", "SK-DOCKER"],
    "optional_skill_ids": [],
    "description": "Phát triển REST API"
  }]
}
```

Trường hợp trên trả skill_only, match_percentage=50.0 và thiếu minh chứng Docker. Không có điểm học lực mặc định. Nếu gửi embedding, bắt buộc gửi embedding_model trên cả hồ sơ và từng job; khác model/kích thước thì bỏ thành phần semantic và trả cảnh báo. Backend phải dùng cùng model, revision và cấu hình vector cho cả hai phía.

Điểm phần trăm là cách biểu diễn điểm xếp hạng, không phải xác suất tuyển. Khi score_available=false, client phải hiển thị “chưa đủ dữ liệu”, không hiển thị 0% như đánh giá tiêu cực. Các trường số cũ vẫn được giữ để mapper Java hiện tại không lỗi.

## Thay đổi hành vi cần chú ý khi tích hợp

- Ranking không tự tạo embedding từ bio/JD nữa. Backend cần bổ sung luồng chuẩn bị/lưu/truyền vector; trước đó kết quả là skill-only.
- Backend đã có migration V33 và cache pgvector theo source hash, task, model, revision, dimension và chunk policy. Khi provider bị tắt/lỗi, luồng tự hạ về skill-only.
- Semantic không có thì loại khỏi công thức, không thay bằng 0.5. GPA vẫn nhận trong DTO để tương thích nhưng không tham gia điểm.
- Formula hiện tại: skill bắt buộc/mong muốn 80/20; hybrid chuẩn hóa 0.55 skill và 0.35 semantic về tổng 1. Trọng số preference 0.15 trong nghiên cứu là mục tiêu giai đoạn sau khi có dữ liệu điều kiện.
- Kỹ năng có assertion_status=mentioned/negated/learning theo dấu hiệu ngôn ngữ; mọi kết quả cần rà soát, không suy ra proficiency.
- Java/frontend giữ mode, warnings, score_available và evidence. Sinh viên xem câu nguồn trước khi xác nhận.
- Fallback Java và Python đã thống nhất 80/20, có fixture kiểm thử dùng chung.
- 422 không phản hồi lại nguyên văn CV/vector. 503 chỉ chứa mã lỗi an toàn.
- CORS mặc định tắt. Dịch vụ dành cho mạng nội bộ; bật SERVICE_API_KEY để kiểm tra X-InternLink-AI-Key. Backend dùng AI_SERVICE_API_KEY cùng giá trị.
- Benchmark sample mặc định không được đăng ký router; số demo không dùng làm kết quả luận văn.

## Kiểm thử

```powershell
.venv/Scripts/python.exe -m pytest -q
```

Bộ test không gọi API thật hoặc dùng CV thật. Test adapter Gemini tự bỏ qua nếu không cài SDK tùy chọn; để kiểm tra adapter, cài thêm requirements-gemini.txt. Tests dùng mock SDK và kiểm tra cả schema SDK hiện có. Dependency đã giới hạn major version; cần khóa phiên bản môi trường đã chọn trước triển khai production.

## Tài liệu

- [Kiến trúc và quyết định thiết kế](ARCHITECTURE.md)
- [Kế hoạch hoàn thành chức năng](IMPLEMENTATION_PLAN.md)
- [Nghiên cứu nền của dự án](../docs/ai/AI_RESEARCH_AND_IMPLEMENTATION_PLAN.md)
- [Workflow triển khai tương tác](IMPLEMENTATION_WORKFLOW.html)

Xem [bàn giao tích hợp](IMPLEMENTATION_STATUS.md) để chạy các màn hình mới. Đã có BM25/Jaccard runner, adapter local E5 và hỗ trợ bản nháp JD/nhật ký/kế hoạch học. Model thật, OCR, cache, hàng đợi và thực nghiệm chuyên gia vẫn là hạng mục tiếp theo.
