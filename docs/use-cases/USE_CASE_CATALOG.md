# CTU InternLink - Mô hình Use Case tổng quát hóa/chuyên biệt hóa

## 1. Định vị hệ thống

**CTU InternLink là hệ thống quản lý toàn trình thực tập doanh nghiệp tích hợp trích xuất kỹ năng và xếp hạng mức phù hợp giữa sinh viên và vị trí thực tập tại Trường Đại học Cần Thơ.**

Hệ thống bao phủ toàn bộ hành trình:

```text
Tài khoản và điều kiện tham gia
→ Doanh nghiệp và vị trí thực tập
→ Trích xuất kỹ năng và xếp hạng phù hợp
→ Ứng tuyển, phỏng vấn và offer
→ Thiết lập placement và thỏa thuận ba bên
→ Task, chấm công, nhật ký và evidence
→ Theo dõi, xử lý ngoại lệ
→ Đánh giá, kết quả và phúc khảo
```

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | 0.2 |
| Trạng thái | DRAFT - Chờ xác nhận nghiệp vụ |
| Phạm vi | Trường Đại học Cần Thơ |
| Mô hình | Use case tổng quát hóa/chuyên biệt hóa |

## 2. Cách đọc mô hình

Mô hình sử dụng ba tầng:

1. **Tầng 0:** `UC-ROOT Quản lý toàn trình thực tập doanh nghiệp`.
2. **Tầng 1:** nhóm use case tổng quát, được đánh dấu `<<abstract>>` và không triển khai trực tiếp.
3. **Tầng 2:** use case chuyên biệt mà actor thực hiện và hệ thống phải hỗ trợ.

Quan hệ:

- **Generalization:** use case chuyên biệt kế thừa mục tiêu và quy tắc chung từ use case tổng quát.
- **Include:** hành vi bắt buộc được dùng lại.
- **Extend:** hành vi tùy chọn hoặc ngoại lệ.

Thao tác giao diện như mở modal, bấm nút hoặc chuyển tab không được xem là use case độc lập.

Trong sơ đồ tổng quan, đường nối từ actor đến use case tổng quát chỉ biểu diễn phạm vi tham gia để hình dễ đọc. Khi vẽ sơ đồ chi tiết theo actor, actor phải nối với các use case chuyên biệt mà họ thực sự thực hiện.

## 3. Actor

| Mã | Actor | Trách nhiệm chính |
|---|---|---|
| ST | Sinh viên | Tìm vị trí phù hợp và hoàn thành chương trình thực tập |
| CR | Đại diện doanh nghiệp | Quản lý tuyển dụng, offer, Mentor và placement của doanh nghiệp |
| CM | Mentor doanh nghiệp | Giao việc, xác nhận hoạt động và đánh giá thực tế |
| LE | Giảng viên hướng dẫn | Giám sát mục tiêu học tập và đánh giá học thuật |
| FA | Cán bộ quản lý thực tập Khoa | Điều phối, phê duyệt và chốt kết quả |
| AD | Quản trị viên hệ thống | Quản lý tài khoản, danh mục, bảo mật và vận hành kỹ thuật |

## 4. Tầng 0 - Use case gốc

### UC-ROOT - Quản lý toàn trình thực tập doanh nghiệp

| ID | Use case tổng quát |
|---|---|
| UC-G01 | Quản lý định danh và điều kiện tham gia |
| UC-G02 | Quản lý doanh nghiệp và tuyển dụng thực tập |
| UC-G03 | Quản lý kỹ năng và xếp hạng mức phù hợp |
| UC-G04 | Quản lý thiết lập chương trình thực tập |
| UC-G05 | Quản lý thực hiện thực tập |
| UC-G06 | Quản lý giám sát và ngoại lệ |
| UC-G07 | Quản lý đánh giá và kết quả |
| UC-G08 | Quản trị nền tảng |

## 5. UC-G01 - Quản lý định danh và điều kiện tham gia

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G01.01 | Import danh sách sinh viên và giảng viên CTU | FA | AD | MVP |
| UC-G01.02 | Kích hoạt tài khoản và đổi mật khẩu lần đầu | ST, LE | AD | MVP |
| UC-G01.03 | Quản lý hồ sơ cá nhân | ST, CR, CM, LE, FA | AD | MVP |
| UC-G01.04 | Xác nhận sinh viên đủ điều kiện thực tập | FA | ST | MVP |

Quy tắc tổng quát:

- Sinh viên và giảng viên sử dụng email do CTU công nhận.
- Người dùng phải đổi thông tin xác thực khởi tạo trước khi truy cập nghiệp vụ.
- Dữ liệu học vụ do Khoa quản lý; sinh viên không tự sửa mã số, Khoa hoặc ngành.

## 6. UC-G02 - Quản lý doanh nghiệp và tuyển dụng thực tập

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G02.01 | Đăng ký và thẩm định doanh nghiệp | CR, FA | AD | MVP |
| UC-G02.02 | Đăng và phê duyệt vị trí thực tập | CR, FA |  | MVP |
| UC-G02.03 | Quản lý ứng tuyển | ST, CR |  | MVP |
| UC-G02.04 | Quản lý phỏng vấn | CR | ST | MVP |
| UC-G02.05 | Quản lý offer | CR | ST | MVP |

`Quản lý ứng tuyển` chuyên biệt hóa thành:

```text
Tìm kiếm/xem vị trí
→ Nộp đơn
→ Theo dõi đơn
→ Rút đơn khi được phép
→ Doanh nghiệp sàng lọc
```

`Quản lý offer` chuyên biệt hóa thành:

```text
Doanh nghiệp phát hành offer
→ Sinh viên xem offer
→ Sinh viên chấp nhận hoặc từ chối
→ Offer được chấp nhận tạo placement chuẩn bị
```

## 7. UC-G03 - Quản lý kỹ năng và xếp hạng mức phù hợp

Đây là năng lực lõi tạo khác biệt của đề tài, không phải chức năng phụ.

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G03.01 | Nộp và quản lý CV | ST |  | MVP |
| UC-G03.02 | Trích xuất kỹ năng từ CV | ST | AI Service | MVP |
| UC-G03.03 | Chuẩn hóa kỹ năng theo danh mục | Hệ thống | AD | MVP |
| UC-G03.04 | Xây dựng hồ sơ kỹ năng sinh viên | ST | Hệ thống | MVP |
| UC-G03.05 | Tính và xếp hạng mức phù hợp | Hệ thống | AI Service | MVP |
| UC-G03.06 | Giải thích kết quả phù hợp | ST | Hệ thống | MVP |

Luồng tổng quát:

```text
CV sinh viên
→ Trích xuất nội dung
→ Nhận diện và chuẩn hóa kỹ năng
→ Kết hợp hồ sơ học tập/kỹ năng
→ So sánh yêu cầu vị trí
→ Tính điểm và xếp hạng
→ Giải thích kỹ năng phù hợp và còn thiếu
```

Ràng buộc:

- AI không quyết định sinh viên có quyền xem vị trí nào.
- Backend lọc vị trí theo trạng thái, Khoa và ngành trước khi xếp hạng.
- Kết quả AI là gợi ý; doanh nghiệp và Khoa vẫn đưa ra quyết định nghiệp vụ.
- Kết quả cần lưu phiên bản mô hình và thời điểm tính để có thể giải thích.

## 8. UC-G04 - Quản lý thiết lập chương trình thực tập

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G04.01 | Quản lý kỳ thực tập | FA | AD | MVP |
| UC-G04.02 | Đăng ký sinh viên vào kỳ thực tập | FA | ST | MVP |
| UC-G04.03 | Phân công giảng viên hướng dẫn | FA | LE | MVP |
| UC-G04.04 | Quản lý và phân công Mentor | CR | CM | MVP |
| UC-G04.05 | Hoàn thiện Learning Agreement ba bên | ST | CM, LE | MVP |
| UC-G04.06 | Kiểm tra và kích hoạt placement | FA | ST, CR | MVP |

Điều kiện kích hoạt placement:

1. Offer hợp lệ đã được sinh viên chấp nhận.
2. Sinh viên thuộc kỳ thực tập và đủ điều kiện.
3. Doanh nghiệp và vị trí đã được phê duyệt.
4. Có Mentor doanh nghiệp và GVHD được phân công.
5. Learning Agreement đã được ba bên xác nhận.

## 9. UC-G05 - Quản lý thực hiện thực tập

Đây là use case tổng quát được chuyên biệt hóa theo hoạt động hằng ngày của sinh viên.

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G05.01 | Lập và duyệt Learning Plan | CM | LE, ST | MVP |
| UC-G05.02 | Giao, nhận và thực hiện task | CM, ST | LE | MVP |
| UC-G05.03 | Ghi nhận và xác nhận chấm công | ST, CM |  | MVP |
| UC-G05.04 | Ghi và duyệt nhật ký thực tập | ST, CM | LE | MVP |
| UC-G05.05 | Nộp và kiểm tra evidence | ST | CM, LE | MVP |
| UC-G05.06 | Phản hồi và theo dõi tiến độ | CM, LE | ST, FA | MVP |

`Giao, nhận và thực hiện task` chuyên biệt hóa thành:

```text
Mentor tạo task
→ Sinh viên nhận task
→ Sinh viên cập nhật tiến độ
→ Sinh viên nộp kết quả/evidence
→ Mentor chấp nhận hoặc yêu cầu sửa
```

`Ghi nhận và xác nhận chấm công` chuyên biệt hóa thành:

```text
Sinh viên check-in
→ Sinh viên check-out
→ Hệ thống tính thời lượng
→ Mentor xác nhận hoặc từ chối
```

`Ghi và duyệt nhật ký thực tập` chuyên biệt hóa thành:

```text
Sinh viên ghi nội dung theo ngày/ca
→ Tổng kết và reflection theo tuần
→ Mentor phản hồi công việc
→ GVHD nhận xét học thuật khi cần
```

## 10. UC-G06 - Quản lý giám sát và ngoại lệ

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G06.01 | Theo dõi cảnh báo và mức tuân thủ | FA | CM, LE | MVP |
| UC-G06.02 | Yêu cầu điều chỉnh chấm công/lịch làm việc | ST | CM, LE | P2 |
| UC-G06.03 | Quản lý nghỉ và ngoại lệ thực tập | ST | CM, LE, FA | P2 |
| UC-G06.04 | Báo cáo và xử lý sự cố/tranh chấp | ST, CM | LE, FA | P2 |
| UC-G06.05 | Chuyển hoặc chấm dứt placement | FA | ST, CR, CM, LE | P2 |

Các use case `UC-G06.02` đến `UC-G06.05` mở rộng luồng thực tập bình thường, không phải điều kiện bắt buộc của mọi placement.

## 11. UC-G07 - Quản lý đánh giá và kết quả

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G07.01 | Đánh giá năng lực thực tế | CM | ST | MVP |
| UC-G07.02 | Đánh giá kết quả học thuật | LE | ST | MVP |
| UC-G07.03 | Tổng hợp, chốt và công bố kết quả | FA | CM, LE | MVP |
| UC-G07.04 | Yêu cầu và xử lý phúc khảo | ST, FA | LE | P2 |
| UC-G07.05 | Khảo sát chất lượng chương trình | ST, CR | FA | LATER |

Kết quả cuối không phải một đánh giá riêng lẻ. Khoa tổng hợp kết quả từ đánh giá Mentor, đánh giá GVHD và mức hoàn thành yêu cầu thực tập.

## 12. UC-G08 - Quản trị nền tảng

| ID | Use case chuyên biệt | Actor chính | Phối hợp | Ưu tiên |
|---|---|---|---|---|
| UC-G08.01 | Quản lý người dùng và quyền truy cập | AD | FA, CR | MVP |
| UC-G08.02 | Quản lý cơ cấu CTU và danh mục nghiệp vụ | AD | FA | MVP |
| UC-G08.03 | Quản lý cấu hình bảo mật và tích hợp | AD |  | MVP |
| UC-G08.04 | Kiểm tra audit và vận hành hệ thống | AD |  | P2 |

Admin không thay Khoa duyệt doanh nghiệp, vị trí, placement hoặc kết quả học thuật.

## 13. Phân rã theo actor

### Sinh viên

```text
Quản lý hành trình thực tập của sinh viên
├── Kích hoạt và quản lý hồ sơ
├── Quản lý CV và hồ sơ kỹ năng
├── Xem xếp hạng vị trí phù hợp
├── Quản lý ứng tuyển
├── Tham gia phỏng vấn
├── Phản hồi offer
├── Hoàn thiện Learning Agreement
├── Nhận và thực hiện task
├── Chấm công
├── Ghi nhật ký và nộp evidence
├── Theo dõi tiến độ
└── Xem kết quả và phúc khảo
```

### Đại diện doanh nghiệp

```text
Quản lý chương trình thực tập của doanh nghiệp
├── Quản lý hồ sơ doanh nghiệp
├── Quản lý vị trí thực tập
├── Quản lý ứng viên và phỏng vấn
├── Quản lý offer
├── Quản lý tài khoản Mentor
├── Phân công Mentor
└── Theo dõi placement của doanh nghiệp
```

### Mentor doanh nghiệp

```text
Hướng dẫn sinh viên thực tập tại doanh nghiệp
├── Xác nhận Learning Agreement
├── Lập Learning Plan
├── Giao và duyệt task
├── Xác nhận chấm công
├── Duyệt nhật ký/evidence
├── Phản hồi tiến độ
└── Đánh giá năng lực thực tế
```

### Giảng viên hướng dẫn

```text
Giám sát học thuật chương trình thực tập
├── Xác nhận Learning Agreement
├── Duyệt Learning Plan và learning outcomes
├── Theo dõi task, nhật ký và evidence
├── Phản hồi học thuật
├── Đề xuất can thiệp
└── Đánh giá kết quả học thuật
```

### Cán bộ quản lý thực tập Khoa

```text
Điều phối toàn trình thực tập của Khoa
├── Quản lý kỳ và điều kiện tham gia
├── Import tài khoản CTU
├── Phân công GVHD
├── Thẩm định doanh nghiệp
├── Phê duyệt vị trí
├── Kiểm tra và kích hoạt placement
├── Giám sát tiến độ/ngoại lệ
├── Tổng hợp đánh giá
└── Công bố kết quả và xử lý phúc khảo
```

### Quản trị viên hệ thống

```text
Quản trị nền tảng CTU InternLink
├── Quản lý tài khoản và quyền
├── Quản lý cơ cấu CTU
├── Quản lý danh mục kỹ năng/tiêu chí
├── Quản lý cấu hình bảo mật/tích hợp
└── Kiểm tra audit và vận hành
```

## 14. Quan hệ include và extend quan trọng

| Use case | Quan hệ | Use case liên quan |
|---|---|---|
| UC-G02.03 Quản lý ứng tuyển | `<<include>>` | Kiểm tra điều kiện sinh viên và trạng thái vị trí |
| UC-G03.05 Xếp hạng mức phù hợp | `<<include>>` | Trích xuất/chuẩn hóa kỹ năng và lọc vị trí được phép xem |
| UC-G02.05 Quản lý offer | `<<extend>>` | Tạo placement khi offer được chấp nhận |
| UC-G04.06 Kích hoạt placement | `<<include>>` | Kiểm tra assignment và Learning Agreement |
| UC-G05.02 Thực hiện task | `<<include>>` | Nộp evidence |
| UC-G05.03 Chấm công | `<<extend>>` | Yêu cầu điều chỉnh khi có sai lệch |
| UC-G05.06 Theo dõi tiến độ | `<<include>>` | Task, attendance, journal và feedback |
| UC-G06.04 Xử lý sự cố | `<<extend>>` | Chuyển hoặc chấm dứt placement nếu nghiêm trọng |
| UC-G07.03 Công bố kết quả | `<<include>>` | Đánh giá Mentor, đánh giá GVHD và kiểm tra hoàn thành |
| UC-G07.04 Phúc khảo | `<<extend>>` | Kết quả đã công bố và còn thời hạn |

## 15. Luồng đầu-cuối chuẩn

1. Khoa import tài khoản và xác nhận sinh viên đủ điều kiện.
2. Doanh nghiệp và vị trí thực tập được thẩm định.
3. Sinh viên nộp CV; hệ thống trích xuất và chuẩn hóa kỹ năng.
4. Hệ thống lọc vị trí hợp lệ, tính điểm và xếp hạng mức phù hợp.
5. Sinh viên ứng tuyển, phỏng vấn và phản hồi offer.
6. Offer được chấp nhận tạo placement chuẩn bị.
7. Khoa phân công GVHD; doanh nghiệp phân công Mentor.
8. Ba bên hoàn thiện Learning Agreement; Khoa kích hoạt placement.
9. Mentor lập kế hoạch, giao task; sinh viên thực hiện và nộp evidence.
10. Sinh viên chấm công, ghi nhật ký; Mentor xác nhận; GVHD giám sát.
11. Hệ thống tổng hợp tiến độ và phát cảnh báo.
12. Mentor và GVHD đánh giá; Khoa chốt và công bố kết quả.
13. Sinh viên yêu cầu phúc khảo nếu có căn cứ và còn thời hạn.

## 16. Quyết định nghiệp vụ cần xác nhận

| ID | Quyết định | Đề xuất |
|---|---|---|
| D-01 | Một tài khoản có nhiều role không? | MVP sử dụng một role chính |
| D-02 | Ai tạo tài khoản Mentor? | Đại diện doanh nghiệp mời, Mentor kích hoạt |
| D-03 | Ai tạo Learning Agreement ban đầu? | Hệ thống tạo draft từ placement |
| D-04 | Ai giao task? | Mentor; GVHD duyệt tính phù hợp ở cấp kế hoạch |
| D-05 | Ai xác nhận chấm công? | Mentor đang được phân công |
| D-06 | Nhật ký theo ngày hay tuần? | Ghi ngày/ca, tổng kết và duyệt theo tuần |
| D-07 | Ai quyết định kết quả cuối? | Cán bộ Khoa dựa trên đánh giá Mentor và GVHD |
| D-08 | AI có thuộc MVP không? | Có, nhưng chỉ tư vấn và giải thích |
| D-09 | Một vị trí được nhắm nhiều ngành không? | Có |
| D-10 | Admin có quyết định nghiệp vụ không? | Không |
