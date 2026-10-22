# Runbook Triển Khai Multilingual E5 & Backfill Vector (InternLink AI Service)

Tài liệu hướng dẫn kỹ thuật phục vụ triển khai mô hình ngữ nghĩa cục bộ **intfloat/multilingual-e5-base** (hoặc `multilingual-e5-small`) trong môi trường nội bộ, bảo đảm tuân thủ nguyên tắc không rò rỉ dữ liệu CV/JD ra đám mây công cộng và chuyển đổi dự phòng an toàn (graceful fallback).

---

## 1. Mục Tiêu & Nguyên Tắc Vận Hành

- **Bảo mật dữ liệu**: Toàn bộ quá trình nhúng ngữ nghĩa (embeddings) cho JD và hồ sơ năng lực sinh viên được xử lý hoàn toàn on-premise/cục bộ qua thư viện HuggingFace Transformers / ONNX Runtime.
- **Tính xác định & Giải trình (Explainability)**:
  - Nếu mô hình ngữ nghĩa khả dụng: áp dụng trọng số Hybrid đã thẩm định (55% kỹ năng + 35% ngữ nghĩa, tái chuẩn hóa về 1.0).
  - Nếu mô hình chưa sẵn sàng hoặc gặp lỗi: dịch vụ tự động chuyển đổi dự phòng an toàn (graceful fallback) về chế độ đối sánh thuần kỹ năng (`skill_only` 80/20) mà không gây gián đoạn hệ thống.
  - Tuyệt đối không giả lập vector ngẫu nhiên hoặc gán điểm giả khi mô hình vắng mặt.

---

## 2. Chuẩn Bị Weights Mô Hình Multilingual E5

### 2.1. Tải weights chính thức từ HuggingFace

Khuyến nghị sử dụng mô hình `intfloat/multilingual-e5-base` (kích thước ~1.1GB, dimension = 768):

```powershell
# Tạo thư mục lưu trữ weights mô hình cục bộ
New-Item -ItemType Directory -Force -Path "ai-service/models/multilingual-e5-base"

# Sử dụng git-lfs hoặc huggingface-cli để tải model snapshot
huggingface-cli download intfloat/multilingual-e5-base `
  --local-dir "ai-service/models/multilingual-e5-base" `
  --local-dir-use-symlinks False
```

Thư mục sau khi tải phải có cấu trúc:
```text
ai-service/models/multilingual-e5-base/
├── config.json
├── model.safetensors (hoặc pytorch_model.bin)
├── tokenizer.json
├── tokenizer_config.json
├── sentencepiece.bpe.model
└── special_tokens_map.json
```

---

## 3. Cấu Hình Dịch Vụ AI (`.env`)

Cập nhật các biến môi trường trong file `.env` của `ai-service`:

```dotenv
# Cấu hình Provider cho nhúng ngữ nghĩa
EMBEDDING_PROVIDER=local_e5
LOCAL_MODEL_PATH=models/multilingual-e5-base
LOCAL_MODEL_REVISION=e5-base-v1
EMBEDDING_DIMENSION=768

# Giữ nguyên trích xuất kỹ năng cục bộ dựa trên luật
EXTRACTION_PROVIDER=rules

# Bảo mật API nội bộ
SERVICE_API_KEY=your_secure_internal_ai_key
```

### Kiểm tra sức khỏe dịch vụ:
Khởi chạy dịch vụ và gọi GET `/`:
```powershell
curl http://127.0.0.1:8001/
```
Phản hồi hợp lệ:
```json
{
  "status": "healthy",
  "service": "InternLink AI Service",
  "capabilities": {
    "extraction": "rules",
    "embedding": "local_e5",
    "ranking": "precomputed_vectors_or_skill_only",
    "provider_connectivity": "not_probed"
  }
}
```

---

## 4. Quy Trình Backfill Vector Cho Dữ Liệu Hiện Hữu

Khi kích hoạt `local_e5`, backend cần đồng bộ vector embedding cho:
1. **Danh mục kỹ năng chuẩn (Taxonomy)**: 51 kỹ năng IT chuẩn hóa.
2. **Tin tuyển dụng đã phê duyệt (`APPROVED`)**: Mô tả công việc và yêu cầu tuyển dụng.

### 4.1. Batch Embedding API Contract

Backend Spring Boot gọi endpoint tạo vector theo batch (`POST /api/v1/matching/embedding/batch`):

```json
{
  "texts": [
    "passage: Lập trình viên Backend Java Spring Boot, RESTful API, PostgreSQL",
    "passage: Kỹ sư kiểm thử tự động, Selenium, CI/CD"
  ],
  "task": "retrieval_document"
}
```

> **Lưu ý định dạng E5**: Đối với mô hình E5, văn bản tài liệu/JD phải có tiền tố `passage: `, trong khi truy vấn/hồ sơ sinh viên có tiền tố `query: `.

### 4.2. Lưu trữ tại Cơ sở Dữ liệu (`backend-core`)

Backend lưu trữ vector vào bảng cache embedding (`V33__ai_embeddings_cache.sql`) với các trường:
- `source_hash`: SHA-256 của nội dung văn bản.
- `model`: `models/multilingual-e5-base`.
- `revision`: `e5-base-v1`.
- `dimension`: `768`.
- `vector`: định dạng pgvector.

---

## 5. Quy Trình Kiểm Thử Ngoại Lệ & Dự Phòng (Graceful Fallback)

| Tình huống ngoại lệ | Phản hồi hệ thống | Hành động của Backend / UI |
|---|---|---|
| Thiếu thư mục weights tại `LOCAL_MODEL_PATH` | Endpoint `/api/v1/matching/embedding` trả mã lỗi HTTP 503 (`local_model_missing`) | Tự động hạ cấp sang tính điểm thuần kỹ năng (`skill_only`). UI hiển thị nhãn: "Đang đối chiếu theo danh sách kỹ năng." |
| Sai lệch phiên bản model giữa sinh viên và JD | `warnings: ["embedding_model_mismatch"]` | Loại bỏ thành phần ngữ nghĩa khỏi công thức xếp hạng, chỉ sử dụng tỷ lệ khớp kỹ năng bắt buộc/ưu tiên. |
| Sinh viên chưa xác nhận kỹ năng nào trong hồ sơ | `warnings: ["student_skills_unknown"]`, `score_available: false` | UI hiển thị "Chưa đủ dữ liệu để tính điểm", không gán 0% như đánh giá tiêu cực. |
| Dịch vụ AI ngoại tuyến | Backend bắt `ResourceAccessException` / Timeout | Chuyển sang fallback service nội bộ của Spring Boot với công thức chuẩn 80/20 tương thích. |
