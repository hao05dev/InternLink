# Kế hoạch hoàn thành tích hợp AI cho InternLink

Ngày: 03/10/2026. Dựa trên bản nghiên cứu thị trường/luận văn và cấu trúc ai-service vừa tổ chức lại.

## Cập nhật sau triển khai

Đã triển khai luồng backend/frontend cho CV, xác nhận kỹ năng, gợi ý theo kỹ năng và màn hình hỗ trợ theo vai trò. Xem [trạng thái, cách chạy và giới hạn hiện tại](IMPLEMENTATION_STATUS.md). Bảng bên dưới lưu mốc dựng nền; các tiêu chí backlog vẫn dùng để nghiệm thu phần nâng cao, không có nghĩa tất cả đã hoàn tất.

## 1. Trạng thái tại mốc dựng nền ban đầu

| Hạng mục | Trạng thái |
|---|---|
| Tách API/schema/service/provider/evaluation/config | Đã thực hiện |
| App factory + dependency injection | Đã thực hiện |
| Bỏ vector ngẫu nhiên và GPA mặc định trong điểm | Đã thực hiện |
| Adapter Gemini SDK mới, timeout, lỗi an toàn, cấu hình opt-in | Đã thực hiện; kiểm thử mock, chưa gọi model thật |
| Extraction evidence từ text và yêu cầu xác nhận | Đã có nền; chưa ingest PDF/OCR, chưa phân tích phủ định |
| Ranking skill-only/hybrid trên vector được cung cấp | Đã có nền; chưa có preference, cache hoặc cơ chế chuẩn bị vector ở backend |
| Metric và benchmark minh họa tách riêng | Đã có; chưa là pipeline thực nghiệm |
| Kiểm thử tự động service | Đã bổ sung; xem kết quả lần chạy trong báo cáo bàn giao |
| Các chức năng mở rộng JD review/journal/learning plan | Chưa triển khai |

Phạm vi đợt hiện tại là dựng cấu trúc chạy được và kế hoạch hoàn thiện. Không đánh dấu xong F1/F2 chỉ vì đã có endpoint. Hoàn thành tính năng phải chạy xuyên suốt qua backend/frontend và được người dùng kiểm tra.

## 2. Thứ tự phụ thuộc

```text
Hợp đồng và quyền dữ liệu
  → Taxonomy + nguồn minh chứng
  → CV/JD ingest + rà soát/xác nhận
  → Embedding versioned + batch + preferences
  → Ranking giải thích + dashboard
  → JD review / nhật ký có dẫn chứng / learning plan

Dataset và nhãn chuyên gia bắt đầu từ đầu, đi cùng mọi giai đoạn.
Benchmark đầy đủ phải hoàn tất trước khi tuyên bố mô hình tốt hơn baseline.
```

## 3. Backlog triển khai

### AI-01 — Cấu hình và vận hành provider (P0)

Nền đã làm: interface, Gemini adapter, disabled/rule mode, bỏ model cũ hard-code, lỗi 503 minh bạch, timeout.

Còn làm: chọn model đang được hỗ trợ trong tài khoản thật; đo chất lượng/chi phí trên dữ liệu được phép; khóa dependency; thêm readiness và service authentication; quyết định CPU/GPU/API. Thử local multilingual E5 làm đối chứng theo nghiên cứu. Không tải model hoặc gửi CV thật tự động.

Nghiệm thu: startup không cần mạng ở rules mode; smoke test riêng xác minh model_id/dimension; provider lỗi không tạo điểm semantic giả; cấu hình/secret không xuất hiện trong log.

### AI-02 — Hợp đồng backend–AI–frontend (P0, làm tiếp ngay)

Vùng mã: AiServiceClient, AiMatchScoreResponse, StudentSkillResponse, AiCvProcessingHandler và giao diện kỹ năng/việc làm.

- Truyền và lưu mode, warnings, algorithm_version, score_available, semantic_available.
- Giữ evidence cùng document_id/source_version; phân biệt student-confirmed và mentor-verified.
- Khi thiếu dữ liệu, UI hiển thị trạng thái thay vì 0% đánh giá tiêu cực.
- Đồng nhất fallback Java 70/30 với Python 80/20; có contract fixture chung cho mandatory-only, optional-only, cả hai và dữ liệu thiếu.
- Batch API từ Spring Boot thay cho gọi từng vị trí; không truyền GPA hoặc thông tin định danh khi không cần.
- Kiểm tra quyền theo đối tượng và theo sự đồng ý chia sẻ, không chỉ role.

Nghiệm thu: cùng input ra cùng skill score giữa Java fallback/Python; metadata không bị mapper bỏ; người không có quyền không xem nguồn hoặc retry tài liệu.

### AI-03 — Taxonomy, alias và evidence (P0)

Giữ SK-* hiện có để không làm hỏng khóa tham chiếu. Bổ sung external_uri/source/version ở backend, import file được duyệt cho Python; không coi tên file esco_it_skills.json là bằng chứng mapping ESCO.

Ưu tiên 150–250 kỹ năng phục vụ nhóm ngành thí điểm, alias Việt–Anh, ngữ cảnh từ ngắn, quan hệ kỹ năng rộng/hẹp và hàng đợi unknown. Tách hard skill, kiến thức, năng lực nghề nghiệp. Người có chuyên môn duyệt alias/mapping.

Nghiệm thu: alias không ánh xạ hai ID mâu thuẫn; không ép unknown vào một kỹ năng gần giống; phiên bản taxonomy gắn vào mỗi AiRun; giữ được nguồn gốc và lịch sử thay đổi.

### AI-04 — F1: CV/JD ingest, extraction, review (P0)

Đầu vào: CV PDF có text/DOCX hoặc nhập text, phiên bản tài liệu, quyền xử lý. Thêm parser ở module ingestion khi triển khai; OCR là bước riêng có phát hiện nhu cầu và thông báo lỗi.

Nâng schema extraction: evidence theo trang/đoạn, assertion=positive/negated/learning/unknown, requirement=mandatory/optional cho JD, nguồn học phần/dự án. Không chấm proficiency từ cách viết CV. Người dùng chọn chấp nhận/sửa/từ chối, backend lưu draft và xác nhận.

Nghiệm thu: upload → chạy job → rà soát → lưu xác nhận hoạt động ở sinh viên và doanh nghiệp; câu “chưa biết Docker” không vào tập kỹ năng có bằng chứng tích cực; AI không ghi đè kỹ năng đã được xác nhận; PDF scan không bị báo như hồ sơ không có kỹ năng.

### AI-05 — Dataset và thực nghiệm (P0, bắt đầu song song AI-02)

Tạo khi có dữ liệu: datasets/manifests, datasets/annotations, evaluation runner/CLI và reports. Không đưa CV thật hoặc API key vào Git; dữ liệu công khai phải có quyền sử dụng.

Mục tiêu pilot trong bản nghiên cứu: khoảng 40 hồ sơ × 25 JD được chấm đầy đủ, hai người chấm trên tập test và phần giao nhau của tập phát triển; có hướng dẫn nhãn 0/1/2 và ghi bất đồng. Chia nhóm theo tài liệu/sinh viên, chống trùng mẫu giữa split; công bố giới hạn cỡ mẫu.

Triển khai thực sự:
1. Tokenizer Việt–Anh và baseline Jaccard.
2. BM25 trên văn bản cùng candidate set.
3. Embedding-only, skill-only và hybrid gọi chung code ranking với hệ thống.
4. Tính nDCG@5/@10, Precision/Recall@K, MRR; F1 extraction/normalization và độ đồng thuận chuyên gia.
5. Ablation có/không preferences, gold skills so với extracted skills; lưu config, revision, checksum và seed.
6. Bootstrap theo sinh viên; báo tỷ lệ nhãn chưa có và trường hợp không có relevant.

Nghiệm thu: chạy lại cùng dataset/config ra cùng kết quả trong sai số công bố; không dùng điểm viết sẵn; không chỉnh trọng số theo test; không tuyên bố đạt mục tiêu nếu chưa đo.

### AI-06 — Chuẩn bị embedding, cache và F2 ranking (P0)

Thêm adapter local E5 và/hoặc model API đã được chọn. Pipeline chia đoạn CV theo cấu trúc, tiền tố query/passage đúng model, tạo vector khi source_version đổi. Bổ sung loại task cho endpoint embedding trước khi dùng asymmetric retrieval. Hiện endpoint embedding chỉ tạo document vector.

Backend giữ vector hoặc kho vector riêng do kiến trúc hệ thống quyết định. Cache key gồm source hash/version + model/revision + dimension + chunk policy. Không lưu cache raw CV trong process lâu dài khi chưa có retention.

Thêm student_preferences: lịch, địa điểm, work mode, định hướng; phân biệt hard filter do người dùng/quy chế khai báo và soft preferences. Kỹ năng bắt buộc là khoảng thiếu/điểm, không tự loại sinh viên bằng AI.

Nghiệm thu: thay CV/JD làm cache cũ mất hiệu lực; không trộn model; batch không phát sinh lời gọi cloud theo từng cặp; metadata giải thích được hiển thị; mục tiêu p95 ≤2 giây cho 200 JD đã chuẩn bị vector được đo trên cấu hình công bố.

### AI-07 — F3 dashboard kỹ năng thiếu (P0)

Backend tổng hợp từ taxonomy chuẩn hóa, JD đã duyệt, kỹ năng đã xác nhận; trả số liệu theo ngành/khóa/kỳ, cỡ mẫu và độ đầy đủ dữ liệu. Đây là thống kê, không cần dùng LLM để đếm.

Nghiệm thu: định nghĩa mẫu số rõ; phân biệt chưa khai báo và thiếu minh chứng; kiểm tra số liệu đối chiếu tay; nhóm nhỏ được xử lý theo chính sách riêng tư trường; không gọi dữ liệu đối tác thí điểm là toàn thị trường.

### AI-08 — F4 rà soát chất lượng JD (P1)

Tạo schemas/job_review.py, services/job_review_service.py, prompt có phiên bản khi bắt đầu hạng mục. Đầu vào checklist khoa đã duyệt, JD và mục tiêu; đầu ra issue_type, severity, quote, rule/source reference, suggested_edit và review_status.

Rule kiểm tra trường bắt buộc; LLM chỉ hỗ trợ phát hiện câu mơ hồ/mâu thuẫn. Người duyệt quyết định xử lý; AI không tự duyệt/từ chối doanh nghiệp.

Nghiệm thu: đánh giá precision/recall cảnh báo với khoa; có nguồn cho mỗi nhận xét; cùng một phiên bản JD không bị tạo đề xuất trùng; mọi thay đổi có lịch sử.

### AI-09 — F5 tóm tắt nhật ký theo kỹ năng (P1)

Thêm schema/service/prompt theo tên journal_summary. Đầu vào chỉ gồm nhật ký và bằng chứng người xem có quyền đọc, trạng thái mentor xác nhận, mục tiêu học tập. Đầu ra từng nhận định gắn evidence_id/source_version.

Nghiệm thu: mọi dẫn chứng mở đúng tài liệu có quyền; nguồn bị thay đổi làm summary cũ cần cập nhật; không tự chấm rubric/CLO. Mục tiêu nhận định được nguồn hỗ trợ ≥95% trên mẫu kiểm tra là mục tiêu dự kiến, chưa đạt chỉ nhờ test kỹ thuật.

### AI-10 — F6 kế hoạch học tập cá nhân hóa (P1)

Từ mục tiêu, khoảng thiếu ưu tiên, quỹ thời gian và học liệu khoa duyệt; sinh bản nháp 1–3 kỹ năng, nhiệm vụ, thời lượng, đầu ra và cách kiểm. Không tự thêm URL/chứng chỉ không có trong danh mục.

Nghiệm thu: mỗi nhiệm vụ truy ngược được về khoảng thiếu/mục tiêu; người dùng điều chỉnh; learning agreement chỉ thay đổi sau quy trình phê duyệt thông thường.

### AI-11 — Pilot, kiểm toán và báo cáo (P0 trước triển khai thật)

Đo thời gian tìm vị trí, rà soát CV/JD/nhật ký so với cách cũ; tỷ lệ sửa đề xuất, lỗi quyền, fallback, latency và cost. Kiểm tra ranking khi đổi tên/thông tin định danh nhưng giữ nội dung kỹ năng. Kiểm toán nhóm chỉ dùng dữ liệu có mục đích/quyền hợp lệ.

Nghiệm thu: dữ liệu nguồn và metrics truy vết được; có chế độ thủ công khi dịch vụ lỗi; người dùng hiểu điểm không phải xác suất; không tự chặn ứng tuyển/chấm điểm học tập.

## 4. Lịch dự kiến

Giả định một người phát triển khoảng 20–25 giờ/tuần, có chuyên gia hỗ trợ gán nhãn. Không tính thời gian hoàn thiện các quy trình nghiệp vụ khác của hệ thống.

| Tuần | Trọng tâm | Điều kiện bàn giao |
|---|---|---|
| 1 | AI-01/02; chốt quy chế, nguồn dữ liệu và chuyên gia | Contract và chế độ lỗi thống nhất |
| 2 | AI-03, pilot annotation AI-05 | Taxonomy có version; rubric nhãn ổn định |
| 3 | AI-04 qua backend/UI | F1 chạy xuyên suốt |
| 4 | Baseline thực AI-05, embedding/cache AI-06 | Các thuật toán chạy từ dữ liệu |
| 5 | Preferences, F2 và giải thích | Ranking đúng dữ liệu; không mất metadata |
| 6 | AI-07, chốt test/ablation | F1–F3 và báo cáo MVP |
| 7 | AI-08 | JD review được khoa kiểm tra |
| 8 | AI-09 | Tóm tắt có nguồn và kiểm soát quyền |
| 9 | AI-10 nếu phần trước đạt; pilot | Learning plan nháp và số đo tác vụ |
| 10 | AI-11, sửa lỗi, báo cáo | Kết quả tái lập và kịch bản demo |

Nếu thời gian còn 4–6 tuần, giữ F1–F3 và thực nghiệm; hoãn F4–F6. GitHub sâu, learning-to-rank và dự báo ngừng thực tập để sau khi có dữ liệu nhiều kỳ, không thuộc tiêu chí hoàn thành đợt này.

## 5. Tiêu chí kết thúc phần tích hợp AI

- Người dùng có thể sửa/xác nhận dữ liệu AI; mọi kết quả quan trọng có nguồn.
- Quyền CV/nhật ký, consent và scope theo đối tượng được kiểm tra ở backend.
- Ranking có baseline, ablation, xử lý thiếu dữ liệu và metadata rõ.
- F1–F3 hoạt động xuyên suốt, dashboard có định nghĩa số liệu.
- Provider lỗi không làm mất khả năng thao tác nghiệp vụ thủ công.
- Tập test/nhãn/config được đóng băng và có báo cáo giới hạn.
- F4–F6 chỉ tuyên bố xong khi người dùng kiểm chứng được và có bộ đánh giá riêng.

## 6. Căn cứ và đầu vào còn cần

Tài liệu nền: [Nghiên cứu AI InternLink](H:/._HK12627/LuanVan/InternLink/docs/AI_RESEARCH_AND_IMPLEMENTATION_PLAN.md), [Mô tả luận văn](H:/._HK12627/LuanVan/InternLink/mo_ta_luan_van.txt).

BP9.1/9.3 định hướng learning agreement và giám sát; BP9.2/9.5 định hướng checklist chất lượng; BP9.4 định hướng năng lực và minh chứng; R25/R26 định hướng taxonomy. Quy chế/CLO/rubric của trường vẫn phải được xác nhận riêng, không thay bằng tài liệu nước ngoài.

Chốt trước pilot: hạn bảo vệ, ngành/khóa, văn bản thực tập đúng phiên bản, quyền dùng dữ liệu, trần chi phí API, máy CPU/GPU và lịch chuyên gia gán nhãn. Có thể làm AI-02/03 và dataset giả lập ngay khi chờ các đầu vào này.
