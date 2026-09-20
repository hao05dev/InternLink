# CTU InternLink - Luồng tổng quan AI Service

> Mục tiêu: giải thích AI tham gia ở đâu, nhận dữ liệu gì, trả kết quả gì và không được quyết định điều gì.

## 1. AI nằm ở đâu trong toàn trình?

```text
Sinh viên cập nhật CV
  -> AI trích xuất và chuẩn hóa kỹ năng
  -> Sinh viên xác nhận hồ sơ kỹ năng
  -> Backend lọc các vị trí sinh viên được phép xem
  -> AI tính điểm và xếp hạng mức phù hợp
  -> Sinh viên xem kỹ năng khớp/thiếu
  -> Sinh viên tự quyết định có ứng tuyển hay không
```

AI chỉ hỗ trợ từ giai đoạn **hồ sơ năng lực** đến **gợi ý vị trí**. Sau khi sinh viên ứng tuyển, quyết định phỏng vấn, offer và kết quả thực tập vẫn do con người thực hiện.

## 2. Thành phần tham gia

| Thành phần | Vai trò |
|---|---|
| Sinh viên | Cung cấp CV, xác nhận kỹ năng và xem gợi ý |
| Frontend | Gửi yêu cầu và hiển thị kết quả |
| Spring Boot Backend | Xác thực, đọc dữ liệu, lọc vị trí, gọi AI và lưu kết quả |
| AI Service | Trích xuất, chuẩn hóa, tạo embedding và xếp hạng |
| Gemini | Hỗ trợ đọc nội dung và tạo embedding khi được cấu hình |
| Database | Lưu CV, kỹ năng, kết quả phân tích và matching |

Frontend không nên gọi trực tiếp AI Service. Mọi yêu cầu đi qua Backend để kiểm soát quyền và dữ liệu.

## 3. Luồng AI tổng quát

```text
Sinh viên tải CV
  -> Backend lưu CV
  -> Backend lấy nội dung text từ CV
  -> Gửi text cho AI Service
  -> AI trích xuất kỹ năng
  -> AI chuẩn hóa kỹ năng theo taxonomy
  -> Kết quả hợp lệ?
     ├─ Không: dùng fallback hoặc yêu cầu xử lý lại
     └─ Có: trả danh sách kỹ năng
  -> Backend lưu kết quả phân tích
  -> Sinh viên xác nhận/chỉnh kỹ năng
  -> Backend tạo hồ sơ kỹ năng chính thức

Sinh viên yêu cầu xem vị trí phù hợp
  -> Backend lọc vị trí theo trạng thái, Khoa/ngành và điều kiện
  -> Còn vị trí hợp lệ?
     ├─ Không: thông báo chưa có vị trí phù hợp
     └─ Có: gửi hồ sơ và danh sách vị trí cho AI
  -> AI tính điểm từng vị trí
  -> AI sắp xếp giảm dần
  -> Backend lưu kết quả
  -> Sinh viên xem điểm, kỹ năng khớp và kỹ năng thiếu
```

## 4. Trích xuất và chuẩn hóa kỹ năng

```text
Nội dung CV
  -> Có Gemini?
     ├─ Có: Gemini nhận diện hard skill, soft skill và mức kinh nghiệm
     └─ Không/lỗi: tìm kỹ năng bằng rule và từ khóa
  -> Với từng kỹ năng tìm được
     -> Khớp chính xác tên/synonym?
        ├─ Có: dùng skill chuẩn
        └─ Không: fuzzy matching
           -> Đạt ngưỡng?
              ├─ Có: ánh xạ về skill gần nhất
              └─ Không: đưa vào danh sách chưa nhận diện
  -> Loại kỹ năng trùng
  -> Trả kỹ năng chuẩn hóa và kỹ năng chưa nhận diện
```

Sinh viên nên xác nhận kết quả trước khi kỹ năng AI đề xuất trở thành hồ sơ kỹ năng chính thức.

## 5. Xếp hạng mức phù hợp

AI hiện xét ba nhóm thông tin:

| Thành phần | Ý nghĩa | Trọng số code hiện tại |
|---|---|---:|
| Skill score | Kỹ năng bắt buộc và tùy chọn đã khớp | 55% |
| Semantic score | Độ tương đồng nội dung hồ sơ và vị trí | 35% |
| Academic score | Chuyên ngành và GPA | 10% |

```text
Một sinh viên + một vị trí
  -> So sánh kỹ năng
  -> So sánh embedding nội dung
  -> Kiểm tra chuyên ngành/GPA
  -> Tính điểm tổng
  -> Xác định kỹ năng đã khớp
  -> Xác định kỹ năng bắt buộc còn thiếu
  -> Sinh lời giải thích
```

Sau đó AI sắp xếp tất cả vị trí theo điểm giảm dần.

## 6. Rẽ nhánh khi AI gặp lỗi

```text
AI/Gemini hoạt động bình thường
  -> Trả kết quả đầy đủ

Gemini lỗi khi trích xuất
  -> Dùng rule-based fallback
  -> Gắn nhãn kết quả fallback

Embedding không khả dụng
  -> Dùng kết quả đã lưu nếu còn hợp lệ
  -> Hoặc chỉ xếp hạng theo kỹ năng
  -> Không dùng vector ngẫu nhiên làm kết quả production

AI Service timeout
  -> Backend giữ CV/yêu cầu
  -> Cho phép retry
  -> Không làm mất dữ liệu
```

## 7. AI được và không được quyết định

| AI được làm | AI không được làm |
|---|---|
| Đề xuất kỹ năng từ CV | Tự xác nhận kỹ năng là đúng |
| Tính điểm phù hợp | Quyết định sinh viên được xem vị trí nào |
| Xếp hạng vị trí hợp lệ | Tự nộp đơn |
| Giải thích kỹ năng khớp/thiếu | Loại ứng viên |
| Gợi ý kỹ năng cần bổ sung | Phát hành offer |
| Hỗ trợ doanh nghiệp đọc hồ sơ khi có quyền | Chốt kết quả thực tập |

## 8. Dữ liệu liên quan

| Dữ liệu | Nơi lưu dự kiến |
|---|---|
| Phiên bản CV | `curriculum_vitaes` |
| Kết quả phân tích CV | `cv_analysis` |
| Danh mục kỹ năng | `skills` |
| Kỹ năng sinh viên | `student_skills` |
| Kỹ năng yêu cầu của vị trí | `job_skills` |
| Kết quả xếp hạng | `matching_results` |
| Vector hồ sơ/vị trí | `student_profiles.embedding`, `jobs.embedding` |

## 9. Hiện trạng code

```text
Frontend AI demo
  -> Đang trả kết quả hard-code bằng setTimeout
  -> Chưa gọi AI thật

Backend
  -> Đã có AiServiceClient
  -> Mới nối endpoint thử trích xuất kỹ năng
  -> Chưa có luồng nghiệp vụ hoàn chỉnh cho CV và ranking

AI Service
  -> Đã có extraction
  -> Đã có normalization
  -> Đã có embedding
  -> Đã có ranking
  -> Chưa được nối đầy đủ với backend và database
```

Vì vậy, **AI Service hiện là prototype thuật toán**, chưa phải pipeline AI hoàn chỉnh trên web.

## 10. Luồng mục tiêu ngắn gọn

```text
CV
-> Trích text
-> Trích xuất kỹ năng
-> Chuẩn hóa kỹ năng
-> Sinh viên xác nhận
-> Tạo hồ sơ kỹ năng
-> Backend lọc vị trí hợp lệ
-> AI tính và xếp hạng
-> Lưu kết quả
-> Hiển thị giải thích
-> Sinh viên quyết định ứng tuyển
```

