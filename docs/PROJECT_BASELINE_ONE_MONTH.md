# CTU InternLink - Baseline chốt phạm vi triển khai trong một tháng

> Đây là mốc chốt để bắt đầu code. Chức năng ngoài phạm vi phải chuyển sang giai đoạn sau luận văn.

## 1. Tên đề tài

**Xây dựng nền tảng quản lý toàn trình thực tập và đối sánh năng lực sinh viên - doanh nghiệp tích hợp AI tại Trường Công nghệ Thông tin và Truyền thông, Đại học Cần Thơ**

## 2. Mục tiêu và phạm vi

Luồng cốt lõi:

~~~text
Kỳ thực tập và sinh viên đủ điều kiện
-> Doanh nghiệp và vị trí
-> Hồ sơ năng lực và AI matching
-> Ứng tuyển, phỏng vấn, offer
-> Thỏa thuận và placement
-> Task, chấm công, nhật ký, minh chứng
-> Ngoại lệ cơ bản
-> Đánh giá Mentor/GVHD
-> Khoa công bố kết quả
~~~

Trong phạm vi:

- Trường CNTT-TT, Đại học Cần Thơ.
- Sáu actor đã thống nhất.
- Một hoặc nhiều kỳ thực tập theo học kỳ/năm học.
- PDF, DOC và DOCX được nộp qua hệ thống.
- File lưu trên Google Drive; PostgreSQL chỉ giữ metadata.
- Hoạt động bên ngoài chỉ ghi nhận trạng thái tối thiểu nếu cần tiếp tục luồng.
- AI trích xuất kỹ năng, chuẩn hóa, xếp hạng và giải thích.

Ngoài phạm vi một tháng:

- Đồng bộ hệ thống đăng ký học phần hoặc E-learning CTU.
- Số hóa mọi thủ tục giấy thực hiện bên ngoài.
- Chữ ký số pháp lý.
- Workflow builder, mobile app, chat và video call.
- GPS/geofencing và chống gian lận nâng cao.
- Payroll, bảo hiểm và hợp đồng lao động.
- Hỗ trợ nhiều trường đại học.
- Huấn luyện hoặc fine-tune mô hình AI.
- Dashboard phân tích nâng cao.

## 3. Sáu actor

| Actor | Trách nhiệm MVP |
|---|---|
| Sinh viên | Tài khoản, hồ sơ/CV, matching, ứng tuyển, offer, task, công, nhật ký, kết quả |
| Đại diện doanh nghiệp | Hồ sơ doanh nghiệp, vị trí, ứng viên, offer, phân công Mentor |
| Mentor doanh nghiệp | Thỏa thuận, task, xác nhận công/nhật ký, đánh giá thực tế |
| Giảng viên hướng dẫn | Mục tiêu học tập, theo dõi nhật ký, nhận xét và đánh giá học thuật |
| Cán bộ quản lý thực tập | Kỳ, roster, phê duyệt, phân công, placement và kết quả |
| Quản trị viên | Tài khoản, quyền, taxonomy, audit và vận hành |

## 4. Quản lý học kỳ thực tập

Bảng internship_terms quản lý toàn bộ thời gian của từng kỳ:

| Thuộc tính | Ý nghĩa |
|---|---|
| code | Mã kỳ, ví dụ HK1_2026_2027 |
| academic_year | Năm học 2026-2027 |
| semester | HK1, HK2 hoặc HE |
| registration_open_at | Mở tiếp nhận sinh viên |
| registration_close_at | Khóa đăng ký |
| application_deadline | Hạn ứng tuyển |
| start_date | Bắt đầu thực tập |
| end_date | Kết thúc thực tập |
| evaluation_deadline | Hạn hoàn tất đánh giá |
| settings JSONB | Số giờ, tần suất nhật ký, trọng số điểm và hạn phúc khảo |

Vòng đời:

~~~text
DRAFT
-> REGISTRATION_OPEN
-> APPLICATION_OPEN
-> ACTIVE
-> EVALUATING
-> CLOSED
~~~

Liên kết:

~~~text
internship_terms 1 -> N student_rosters
internship_terms 1 -> N job_positions
internship_terms 1 -> N internship_placements
~~~

Quy tắc:

1. Chỉ kỳ đang mở mới nhận roster/application.
2. Placement chỉ hoạt động trong thời gian cho phép.
3. Kỳ EVALUATING không tạo application hoặc placement mới.
4. Kỳ CLOSED chỉ đọc; thao tác quản trị phải được audit.

## 5. Kiến trúc chốt

~~~text
Next.js Frontend
        |
        v
Spring Boot Backend
   |         |          |
   v         v          v
PostgreSQL  FastAPI AI  Google APIs
                         |- Google Identity
                         |- Google Drive
                         |- Email sender
~~~

Nguyên tắc:

- Frontend không gọi AI hoặc Drive trực tiếp.
- Backend kiểm soát quyền, trạng thái và transaction.
- AI Service không ghi trực tiếp database nghiệp vụ.
- File không lưu trong source code.
- Notification chỉ được tạo sau khi nghiệp vụ thành công.
- Transition quan trọng phải ghi state_history.

## 6. Xác thực và Google

Sinh viên, GVHD và cán bộ CTU:

~~~text
Khoa import roster/tài khoản
-> Người dùng Sign in with Google
-> Backend xác minh Google ID token
-> Kiểm tra email_verified và hosted domain
-> Đối chiếu roster/email
-> Gán đúng role
~~~

Nếu chưa được cấp Google Workspace trong hai ngày đầu, dùng tài khoản import, mật khẩu mặc định và bắt đổi mật khẩu. Không để việc xin quyền Google chặn tiến độ.

Doanh nghiệp và Mentor:

- Được tạo/mời bằng email.
- Xác minh bằng OTP hoặc verification link.
- MVP chỉ gửi email, không đọc Gmail inbox.
- OTP lưu hash, hết hạn 5-10 phút và có rate limit.

## 7. Lưu trữ tài liệu

MVP hỗ trợ PDF, DOC, DOCX; tối đa 10 MB.

~~~text
Upload
-> Backend kiểm tra role, context, MIME và size
-> Upload Google Drive
-> Nhận provider_file_id
-> Lưu documents metadata
-> Ghi audit
-> Preview/download sau khi kiểm tra quyền
~~~

Documents lưu:

~~~text
owner_user_id
context_type + context_id
document_type
storage_provider
provider_file_id
provider_folder_id
original_name
mime_type
size_bytes
checksum
visibility
status
~~~

Không cấp quyền public anyone-with-link cho CV, phiếu đánh giá hoặc báo cáo.

## 8. Database chốt

Có **26 bảng ứng dụng**. PostgreSQL còn hiển thị flyway_schema_history nên tổng bảng vật lý có thể là 27.

| Nhóm | Bảng |
|---|---|
| Tổ chức và danh tính | departments, academic_programs, users |
| Sinh viên | student_rosters, student_profiles |
| Doanh nghiệp và kỳ | companies, internship_terms |
| AI và kỹ năng | skill_taxonomies, student_skills, job_skills, ai_runs |
| Tuyển dụng | job_positions, job_applications, placement_offers |
| Thiết lập | learning_agreements, internship_placements |
| Thực hiện | placement_tasks, attendance_logs, weekly_logbooks, documents |
| Ngoại lệ | internship_cases |
| Đánh giá | rubric_evaluations, final_results |
| Hỗ trợ và lịch sử | notifications, state_history, audit_logs |

Chi tiết thuộc tính và liên kết nằm trong docs/data-model/LEAN_26_TABLE_CDM_DICTIONARY.md.

JSONB được dùng cho:

- Address, certificate/course snapshot và preferences.
- Taxonomy aliases.
- Target programs/outcomes.
- AI input/output và explanation snapshot.
- Interview rounds đơn giản.
- Signature metadata, schedule và learning outcomes.
- Rubric criteria.
- Case detail/resolution.
- Notification delivery và audit metadata.

Không dùng JSONB thay thế:

- User/role và quan hệ FK.
- Student skill và job skill.
- Application, offer, placement.
- Task, attendance, logbook.
- Document metadata.
- Evaluation, final result, notification, history và audit row.

## 9. AI chốt

AI không train mô hình.

Thành phần:

- Gemini pretrained để trích xuất kỹ năng và embedding.
- Taxonomy kỹ năng cục bộ.
- Exact/fuzzy normalization.
- Hybrid scoring có giải thích.

Pipeline:

~~~text
CV PDF/DOCX
-> Trích text
-> AI nhận diện kỹ năng
-> Chuẩn hóa về taxonomy
-> Sinh viên xác nhận
-> Lưu student_skills

Job description
-> Chuẩn hóa job_skills

Backend lọc job theo kỳ, ngành và trạng thái
-> AI tính điểm
-> Xếp hạng
-> Giải thích matched/missing skills
-> Lưu ai_runs
-> Khi ứng tuyển lưu ai_match_detail snapshot
~~~

Công thức MVP:

~~~text
final_score
= 55% skill_score
+ 35% semantic_score
+ 10% academic_score
~~~

AI không quyết định điều kiện tham gia, duyệt vị trí, tuyển dụng hoặc kết quả thực tập.

Đánh giá luận văn sử dụng tập kiểm thử nhỏ có nhãn chuyên gia để so sánh Skill-only, Semantic-only và Hybrid bằng Precision@K, MRR và nDCG. Đây là evaluation dataset, không phải training dataset.

## 10. Luồng hoạt động chốt

### 10.1 Chuẩn bị kỳ

~~~text
FA tạo kỳ
-> Import roster sinh viên/GVHD
-> Người dùng kích hoạt tài khoản
-> FA xác nhận sinh viên đủ điều kiện
~~~

### 10.2 Doanh nghiệp và vị trí

~~~text
CR tạo doanh nghiệp
-> FA xác minh
-> CR đăng vị trí
-> FA phê duyệt
-> Job hiển thị đúng kỳ/ngành
~~~

### 10.3 AI và ứng tuyển

~~~text
ST upload CV
-> AI trích xuất
-> ST xác nhận kỹ năng
-> Backend lọc job
-> AI xếp hạng
-> ST ứng tuyển
-> CR review/phỏng vấn đơn giản
-> CR phát offer
-> ST chấp nhận hoặc từ chối
~~~

### 10.4 Khởi tạo placement

~~~text
Offer ACCEPTED
-> FA phân công GVHD
-> CR phân công Mentor
-> Learning Agreement xác nhận nội bộ
-> FA kiểm tra điều kiện
-> Placement ACTIVE
~~~

### 10.5 Thực hiện

~~~text
CM giao task
-> ST cập nhật/nộp task
-> CM review

ST ghi attendance đơn giản
-> CM xác nhận

ST nộp weekly logbook + evidence
-> CM nhận xét
-> LE nhận xét học thuật
~~~

### 10.6 Ngoại lệ

MVP chỉ có một quy trình case:

~~~text
ST/CM/LE báo cáo
-> FA tiếp nhận
-> Yêu cầu bổ sung nếu thiếu
-> RESOLVED hoặc REJECTED
~~~

Sửa công, sự cố, chuyển nơi, nghỉ ngang và phúc khảo dùng chung internship_cases; không xây workflow riêng trong tháng đầu.

### 10.7 Đánh giá

~~~text
CM nộp FINAL evaluation
-> LE nộp FINAL evaluation
-> FA kiểm tra dữ liệu
-> Tổng hợp final result
-> FA công bố
-> ST xem kết quả
~~~

## 11. Kịch bản demo bắt buộc

1. FA tạo kỳ HK1 2026-2027.
2. FA import một sinh viên và một GVHD.
3. CR tạo doanh nghiệp và được xác minh.
4. CR đăng vị trí và được duyệt.
5. ST upload CV lên Drive.
6. AI trích xuất và chuẩn hóa kỹ năng.
7. ST xem ranking và ứng tuyển.
8. CR tạo offer; ST chấp nhận.
9. FA/CR phân công GVHD và Mentor, kích hoạt placement.
10. CM giao task; ST nộp task và logbook.
11. ST upload evidence; CM/LE xem đúng quyền.
12. CM và LE đánh giá.
13. FA công bố final result.
14. Các bên nhận notification.
15. Admin xem state history và audit log.

Nếu 15 bước này chạy xuyên suốt, sản phẩm luận văn đã hoàn chỉnh.

## 12. Kế hoạch bốn tuần

### Tuần 1 - Nền móng

- Chốt Flyway 26 bảng.
- Auth/JWT/role.
- Import roster CSV.
- Internship term và academic program.
- Company/job CRUD và phê duyệt.
- StorageService, Drive hoặc fallback local.
- Seed sáu tài khoản demo.

Kết quả: đăng nhập đúng role, tạo kỳ, import, duyệt doanh nghiệp/vị trí và upload file.

### Tuần 2 - AI và tuyển dụng

- Student profile/CV.
- Parse PDF/DOCX.
- AI extraction và xác nhận skill.
- Job skills.
- Filter, ranking và explanation.
- Application, interview JSONB tối giản.
- Offer và phản hồi.

Kết quả: sinh viên đi từ CV đến offer accepted.

### Tuần 3 - Quá trình thực tập

- Agreement xác nhận nội bộ.
- Placement activation.
- Mentor/GVHD assignment.
- Task.
- Attendance đơn giản.
- Weekly logbook/evidence.
- Rubric evaluation.
- Final result.

Kết quả: placement đi từ ACTIVE đến kết quả cuối.

### Tuần 4 - Hoàn thiện

- Notification, state history và audit.
- Generic internship case.
- Authorization tài liệu.
- Integration test happy path.
- Sửa lỗi, khóa dữ liệu demo.
- CDM, BPMN, architecture và API document.
- Chuẩn bị kịch bản demo.

Kết quả: demo đầu-cuối ổn định và có tài liệu.

## 13. Ước lượng thực tế

Một tháng tương đương khoảng 20-26 ngày làm việc.

| Điều kiện | Khả năng |
|---|---|
| 6-8 giờ/ngày, giữ nguyên scope, dùng code hiện có | Có thể hoàn thành MVP |
| 3-4 giờ/ngày | Rủi ro cao; bỏ attendance UI và case nâng cao |
| Dưới 3 giờ/ngày | Khó hoàn thành frontend, backend, AI và tích hợp |
| Tiếp tục đổi schema sau tuần 1 | Gần như chắc chắn trễ |

Ước lượng:

- MVP chạy được: 4 tuần tập trung.
- Ổn định và viết luận văn tốt: cần thêm 1-2 tuần nếu có thể.
- Toàn bộ chức năng lý tưởng: 8-12 tuần, không phù hợp hiện tại.

## 14. Luật chống trượt phạm vi

1. Không thêm actor.
2. Không thêm bảng sau ngày thứ hai, trừ lỗi nghiêm trọng.
3. Không xây ngoài kịch bản demo 15 bước.
4. Làm happy path trước.
5. Ngoại lệ dùng chung internship_cases.
6. Không làm giao diện cầu kỳ.
7. Google integration phải có fallback.
8. AI lỗi phải fallback.
9. Cuối tuần 3 dừng chức năng mới.
10. Tuần 4 chỉ kiểm thử, sửa lỗi, tài liệu và demo.

## 15. Quyết định cuối

- Phạm vi: Trường CNTT-TT, Đại học Cần Thơ.
- Mô hình: quản lý toàn trình thực tập, không phải web tuyển dụng chung.
- Actor: sáu.
- Database: 26 bảng ứng dụng và Flyway technical table.
- File: Google Drive qua documents; không lưu trong source.
- Auth: Google cho CTU nếu có quyền; OTP/link cho doanh nghiệp.
- AI: Gemini pretrained, taxonomy và hybrid matching; không train.
- MVP: một happy path đầu-cuối và một generic exception case.
- Thời gian: bốn tuần tập trung, không mở rộng scope.

