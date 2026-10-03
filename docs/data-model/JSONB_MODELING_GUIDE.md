# CTU InternLink - Hướng dẫn thiết kế Lean Database với PostgreSQL JSONB

> Tài liệu này đánh giá bản phác thảo 15 bảng và đưa ra quy tắc sử dụng JSONB sao cho vẫn bảo đảm toàn bộ nghiệp vụ quản lý thực tập, sáu actor và luồng AI. Mục tiêu không phải giảm số bảng bằng mọi giá, mà giảm những bảng chi tiết không cần thiết mà không làm mất quan hệ, lịch sử và khả năng kiểm soát dữ liệu.

## 1. Kết luận ngắn

Bản 15 bảng là nền móng tốt nhưng chưa đủ cho toàn bộ chức năng đã xác định. JSONB nên được dùng để gom:

- Value object nhỏ, luôn thuộc về một bản ghi cha.
- Snapshot không cần FK tới từng phần tử.
- Cấu hình linh hoạt, ít truy vấn độc lập.
- Kết quả AI có cấu trúc thay đổi theo phiên bản.
- Danh sách bounded, không có vòng đời độc lập.

JSONB không nên được dùng để thay thế:

- Quan hệ giữa các thực thể.
- Dữ liệu cần khóa ngoại hoặc unique.
- Dữ liệu có trạng thái, phê duyệt hoặc người chịu trách nhiệm riêng.
- Dữ liệu phát sinh nhiều và cần phân trang/truy vấn riêng.
- Lịch sử/audit quan trọng.
- Dữ liệu lõi dùng để đối sánh AI.

Với phạm vi CTU InternLink và yêu cầu có hộp thông báo cùng lịch sử kiểm toán, mô hình hợp lý gồm **26 bảng**. Đây vẫn là mô hình lean so với 50 bảng.

## 2. Quy tắc quyết định dùng JSONB

Trước khi đưa một nhóm dữ liệu vào JSONB, trả lời lần lượt:

```text
Dữ liệu có định danh và vòng đời riêng?
  ├─ Có -> Tách bảng
  └─ Không
     -> Có được thực thể khác tham chiếu bằng FK?
        ├─ Có -> Tách bảng
        └─ Không
           -> Có cần tìm kiếm, thống kê hoặc phân trang thường xuyên?
              ├─ Có -> Cột quan hệ hoặc bảng
              └─ Không
                 -> Có phải tập con nhỏ, luôn đọc cùng bản ghi cha?
                    ├─ Có -> JSONB phù hợp
                    └─ Không -> Xem xét tách bảng
```

### 2.1 Dấu hiệu JSONB phù hợp

| Dấu hiệu | Ví dụ trong hệ thống |
|---|---|
| Không có ID/vòng đời độc lập | Địa chỉ doanh nghiệp |
| Luôn được đọc cùng bản ghi cha | Các chữ ký trên Learning Agreement |
| Cấu trúc có thể mở rộng | Cấu hình kỳ thực tập |
| Là snapshot tại một thời điểm | Chi tiết điểm AI lúc nộp đơn |
| Số phần tử nhỏ và có giới hạn | Tám tiêu chí NACE trong một phiếu rubric |
| Không cần FK từ phần tử JSON | Alias của một kỹ năng |

### 2.2 Dấu hiệu không nên dùng JSONB

| Dấu hiệu | Ví dụ trong hệ thống |
|---|---|
| Có người phụ trách và deadline riêng | Task thực tập |
| Có trạng thái và transition riêng | Offer, application, case ngoại lệ |
| Cần FK tới master data | Kỹ năng sinh viên và kỹ năng vị trí |
| Cần truy vấn theo từng phần tử | Chấm công từng ca |
| Cần lịch sử không được ghi đè | State history |
| Có quyền truy cập riêng | Document/evidence |
| Là kết quả chính thức | Final result |

## 3. Đánh giá JSONB trong 15 bảng hiện tại

### 3.1 Nên giữ JSONB

| Bảng.Thuộc tính | Quyết định | Vì sao | Cấu trúc đề nghị |
|---|---|---|---|
| `companies.address` | GIỮ | Address là value object thuộc doanh nghiệp, không có vòng đời riêng trong MVP | Mã tỉnh/quận/phường, tên snapshot, street, latitude, longitude |
| `skill_taxonomies.aliases` | GIỮ | Alias luôn thuộc một skill và chỉ là tập chuỗi nhỏ | Mảng string duy nhất, lowercase index khi load vào AI |
| `job_positions.target_learning_outcomes` | GIỮ | Outcome là danh sách mô tả thuộc vị trí | Mảng object gồm code, description, evidenceExpectation |
| `job_applications.ai_match_detail` | GIỮ | Đây là snapshot giải thích tại thời điểm ứng tuyển | Run ID, model version, matched/missing skill IDs, component scores |
| `learning_agreements.student_signature` | GIỮ | Chữ ký là value object của agreement | signerUserId, signedAt, documentHash, method |
| `learning_agreements.company_signature` | GIỮ | Như trên | representativeUserId, signedAt, documentHash, method |
| `learning_agreements.faculty_signature` | GIỮ | Như trên | approverUserId, approvedAt, decisionNo, documentHash |
| `internship_placements.work_schedule` | GIỮ CÓ ĐIỀU KIỆN | Lịch tuần nhỏ và luôn thuộc placement | timezone, weekdays, startTime, endTime, hoursPerWeek, effectiveFrom |
| `rubric_evaluations.criteria_scores` | GIỮ CÓ ĐIỀU KIỆN | Rubric có đúng tám năng lực, luôn nộp cùng một phiếu | competencyId, score, weight, comment, evidenceDocumentIds |
| `student_profiles.certificates` | GIỮ CHO MVP | Chưa có workflow xác minh độc lập | name, issuer, issuedAt, expiresAt, credentialId, documentId |
| `student_profiles.passed_courses` | GIỮ CHO MVP | Dùng làm feature hồ sơ, chưa quản lý học vụ đầy đủ | courseCode, name, credits, grade, completedAt |

### 3.2 Cần thay đổi cách dùng JSONB

| Thuộc tính hiện tại | Vấn đề | Hướng sửa |
|---|---|---|
| `student_profiles.skills` | Dùng tên tự do, không FK đến taxonomy, dễ trùng và sai synonym | Tách thành `student_skills`; JSONB chỉ giữ AI evidence/snapshot nếu cần |
| `job_positions.required_skills` | Không bảo đảm skill ID hợp lệ; khó phân biệt mandatory/optional và mức yêu cầu | Tách thành `job_skills` |
| `job_applications.interview_info` | Một object không hỗ trợ nhiều vòng, đổi lịch và lịch sử | Có thể đổi thành `interview_rounds` JSONB array nếu số vòng nhỏ và chỉ thuộc application |
| `learning_agreements.amendments` | Amendment có người đề xuất, phê duyệt và trạng thái riêng | MVP có thể giữ JSONB append-only; nếu quy trình sửa đổi phức tạp thì tách bảng sau |
| `weekly_logbooks.evidence_urls` | URL không có owner, type, access policy hoặc checksum | Dùng bảng `documents`; logbook chỉ tham chiếu document thông qua context |
| `rubric_evaluations.appeal_*` | Phúc khảo áp dụng cho kết quả cuối, không thuộc riêng từng phiếu đánh giá | Chuyển sang `final_results.appeal` hoặc `internship_cases` |
| `attendance_logs.dispute_reason` | Chỉ có lý do, không có người xử lý và quyết định | Chuyển tranh chấp sang `internship_cases`; attendance giữ trạng thái DISPUTED |

### 3.3 Không nên biến thành JSONB

| Dữ liệu | Vì sao bắt buộc quan hệ/bảng |
|---|---|
| User roles và tổ chức | Cần authorization, FK và kiểm tra role |
| Student eligibility theo kỳ | Cần unique theo sinh viên-kỳ và truy vấn danh sách |
| Skill taxonomy relationships | Là dữ liệu lõi cho AI matching |
| Applications và offers | Có state machine, deadline và actor riêng |
| Placement assignments | Mentor/GVHD phải là FK đến user |
| Tasks | Có assignee, deadline, status, evidence và review |
| Attendance | Phát sinh nhiều, truy vấn theo ngày/placement |
| Documents | Có quyền truy cập và metadata bảo mật |
| Evaluations | Có evaluator, stage và trạng thái nộp riêng |
| Final result | Là quyết định chính thức của Khoa |
| Exception/dispute/termination case | Có reporter, handler, status và resolution |
| State history | Phải append-only và truy vấn được |

## 4. Hướng sửa từng bảng trong bản phác thảo

### 4.1 `departments`

Không cần JSONB. Đây là master data cần cột rõ ràng.

Nên bỏ `faculty_head_name` dạng text và dùng `faculty_head_user_id` nếu hệ thống thật sự cần biết người phụ trách. Tên có thể thay đổi; user ID mới là quan hệ ổn định.

### 4.2 `users`

Không đưa role, department hoặc company vào JSONB.

Để giữ lean và theo giả định MVP một tài khoản có một role chính:

```text
department_id  -- cho STUDENT, LECTURER, FACULTY_ADMIN
company_id     -- cho COMPANY_REP, COMPANY_MENTOR
role           -- một role chính
```

Áp dụng CHECK để role CTU phải có department và role doanh nghiệp phải có company. Nếu sau này một người có nhiều role/tổ chức, lúc đó mới tách `user_memberships`.

Cần thêm:

```text
must_change_password
password_changed_at
last_login_at
```

để hỗ trợ mật khẩu mặc định và bắt buộc đổi lần đầu.

### 4.3 `student_rosters`

Không dùng JSONB cho điều kiện tham gia. Cần thêm:

```text
term_id
program_id hoặc major_code chuẩn hóa
claimed_user_id
eligibility_status
eligibility_note
```

Khóa duy nhất nên là `(term_id, student_code)`. Bảng này vừa là danh sách import, vừa chứng minh sinh viên đủ điều kiện ở kỳ nào.

### 4.4 `student_profiles`

Giữ JSONB cho:

- `certificates`
- `passed_courses`
- `preferences`: location, work format, industry preference

Không giữ `skills` dạng mảng tên. Dùng `student_skills` để liên kết taxonomy.

CV không nên chỉ là `cv_url`. File và quyền truy cập do bảng `documents` quản lý; CV hiện hành được xác định bằng `owner_user_id`, `document_type = 'CV'` và `is_current = true`. Không tạo FK ngược từ `student_profiles` sang `documents`, nhờ vậy tránh vòng phụ thuộc và vẫn lưu được nhiều phiên bản CV.

`cv_raw_text` không nên nằm trong profile vì có thể lớn, nhạy cảm và thay đổi theo phiên bản CV. Lưu trong AI run hoặc storage được bảo vệ theo retention policy.

### 4.5 `companies`

`address JSONB` phù hợp nếu hệ thống không cần danh mục địa giới riêng.

Cấu trúc nên dùng cả code và snapshot:

```json
{
  "provinceCode": "92",
  "provinceName": "Cần Thơ",
  "districtCode": "...",
  "districtName": "Ninh Kiều",
  "wardCode": "...",
  "wardName": "Xuân Khánh",
  "street": "Số 1, đường 3/2"
}
```

`verified_by_faculty` phải là `verified_by_user_id` có FK đến `users`.

Nếu cần giữ checklist thẩm định, `verification_detail JSONB` là phù hợp vì nó là snapshot của một lần quyết định trong mô hình MVP.

### 4.6 `skill_taxonomies`

`aliases JSONB` phù hợp. Các trường ID, name, category và framework phải là cột thường để AI truy vấn và ràng buộc.

Nên có `taxonomy_version` hoặc `updated_at` để biết matching dùng phiên bản nào.

### 4.7 `internship_terms`

Các mốc thời gian chính phải là cột.

Có thể thêm `settings JSONB` cho các cấu hình thay đổi theo kỳ:

```json
{
  "requiredHours": 320,
  "maxApplications": 5,
  "appealDays": 7,
  "logbookFrequency": "WEEKLY"
}
```

Không đặt deadline quan trọng vào JSON vì cần query và validation.

### 4.8 `job_positions`

Giữ JSONB cho:

- `target_learning_outcomes`
- `benefits` nếu là danh sách nhỏ
- `screening_questions` nếu câu hỏi chỉ thuộc vị trí

Không giữ `required_skills` trong JSONB. Dùng `job_skills` với:

```text
job_id
skill_id
requirement_type = MANDATORY | OPTIONAL
required_level
weight
```

Để lọc đúng ngành, cần `target_program_ids`. Nếu chưa muốn bảng liên kết, có thể dùng JSONB array mã ngành được application validation, nhưng `academic_programs` vẫn phải là master data.

### 4.9 `job_applications`

Các cột relation và status giữ dạng cột thường.

`ai_match_detail JSONB` phù hợp vì đây là snapshot tại thời điểm nộp đơn:

```json
{
  "runId": "...",
  "modelVersion": "...",
  "taxonomyVersion": "...",
  "score": 82.5,
  "components": {
    "skill": 0.86,
    "semantic": 0.81,
    "academic": 0.70
  },
  "matchedSkillIds": ["sk_java"],
  "missingSkillIds": ["sk_docker"]
}
```

Đổi `interview_info` thành `interview_rounds JSONB` chỉ khi chấp nhận giới hạn:

- Mỗi application có ít vòng.
- Không cần query lịch phỏng vấn toàn hệ thống bằng từng row.
- Mọi cập nhật đi qua Application aggregate và optimistic locking.

Mỗi phần tử phải có `roundId`, `scheduledAt`, `status`, `format`, `participants`, `result` và timestamps.

### 4.10 `placement_offers`

Offer phải là bảng vì có deadline và state machine.

Không lưu Mentor bằng tên/email. Hoặc dùng `proposed_mentor_id`, hoặc chỉ phân công Mentor khi tạo placement.

Có thể thêm `terms_snapshot JSONB` cho các điều khoản không cần query riêng, ví dụ working conditions, allowance notes và benefits snapshot.

Trạng thái nên có thêm `WITHDRAWN`.

### 4.11 `learning_agreements`

Ba chữ ký JSONB là hợp lý, nhưng mỗi object phải chứa:

- User ID người ký/phê duyệt.
- Thời điểm.
- Phương thức xác nhận.
- Hash của đúng phiên bản tài liệu.

`amendments JSONB` được chấp nhận cho MVP nếu:

- Số amendment ít.
- Chỉ truy cập qua agreement.
- Dữ liệu append-only.
- Mỗi amendment có ID, proposer, reason, changes, status, approvals và timestamps.
- Mọi thay đổi đồng thời ghi `state_history`.

Nếu amendment cần tìm kiếm, giao việc, phê duyệt nhiều bước hoặc đính kèm riêng thì phải tách bảng.

### 4.12 `internship_placements`

Placement phải giữ các FK student, company, mentor, lecturer, term và agreement.

`work_schedule JSONB` hợp lý nếu là lịch tuần đơn giản. Khi đổi lịch có hiệu lực theo giai đoạn, lưu `scheduleVersions` hoặc tạo case thay đổi; không ghi đè làm mất lịch cũ.

`total_hours_worked` là dữ liệu dẫn xuất từ attendance. Có thể cache để hiển thị nhanh nhưng phải có quy tắc tái tính; không xem nó là nguồn sự thật duy nhất.

### 4.13 `attendance_logs`

Mỗi ca chấm công phải là row, không gom JSONB.

GPS có thể giữ cột riêng nếu cần lọc khoảng cách hoặc dùng PostGIS. Nếu chỉ lưu bằng chứng, có thể dùng:

```json
{
  "latitude": 10.03,
  "longitude": 105.78,
  "accuracyMeters": 20,
  "capturedAt": "..."
}
```

Tranh chấp không nên chỉ là `dispute_reason`; hãy tạo một `internship_case` loại `ATTENDANCE_DISPUTE` tham chiếu attendance ID trong payload.

### 4.14 `weekly_logbooks`

Nội dung reflection và feedback giữ dạng cột text.

Không lưu URL minh chứng tự do. Tệp/link phải được quản lý bởi `documents` để kiểm soát:

- Chủ sở hữu.
- Loại tài liệu.
- MIME type, size, checksum.
- Quyền truy cập.
- Placement/application/agreement/task/logbook liên quan.

Nếu evidence chỉ là GitHub public link, vẫn nên lưu thành Document type `EXTERNAL_LINK`.

### 4.15 `rubric_evaluations`

`criteria_scores JSONB` phù hợp với rubric cố định tám năng lực NACE.

Điều kiện:

- Mỗi item dùng `competencyId`, không dùng text tự do.
- Đúng tám competency theo rubric version.
- Score nằm trong khoảng cho phép.
- Lưu `rubricVersion`.
- `final_score` được backend tính từ criteria, không nhận tùy ý từ client.

Không đặt appeal trong evaluation. Appeal thuộc `final_results` hoặc một `internship_case` loại `RESULT_APPEAL`.

## 5. Các bảng còn thiếu để bảo đảm nghiệp vụ

### 5.1 `academic_programs`

Đảm bảo lọc tin theo ngành trong phạm vi CTU.

```text
id, department_id, code, name, is_active
```

### 5.2 `student_skills`

Đảm bảo hồ sơ kỹ năng có FK tới taxonomy và ghi được nguồn/confidence.

```text
student_id, skill_id, source, confidence, confirmed, evidence_document_id
```

### 5.3 `job_skills`

Đảm bảo AI biết kỹ năng bắt buộc/tùy chọn và trọng số.

```text
job_id, skill_id, requirement_type, required_level, weight
```

### 5.4 `placement_tasks`

Đảm bảo use case Mentor giao việc và sinh viên thực hiện.

```text
id, placement_id, assigned_by_mentor_id, title, description,
learning_outcome_codes JSONB, due_at, status, submitted_at,
reviewed_at, mentor_feedback, version
```

Checklist nhỏ hoặc output summary có thể là JSONB; task vẫn phải là row.

### 5.5 `documents`

Đảm bảo CV, agreement, evidence và rubric attachment có metadata và quyền truy cập.

```text
id, owner_user_id, context_type, context_id, document_type,
storage_key, original_name, mime_type, size_bytes, checksum,
visibility, created_at
```

`context_type/context_id` là quan hệ polymorphic được backend kiểm soát. Nếu cần FK tuyệt đối, tách document links theo từng aggregate ở giai đoạn sau.

### 5.6 `ai_runs`

Gom lịch sử extraction, embedding và ranking mà không cần nhiều bảng AI riêng.

```text
id, run_type, student_id, source_document_id, status,
model_name, model_version, taxonomy_version,
input_hash, input_snapshot JSONB, output_result JSONB,
error_detail JSONB, started_at, completed_at
```

Đây là nơi JSONB phát huy tốt nhất vì input/output AI thay đổi theo phiên bản và là snapshot. Kỹ năng đã xác nhận vẫn được đẩy sang `student_skills`; không dùng output JSON làm hồ sơ chính thức.

### 5.7 `final_results`

Đảm bảo có một kết quả chính thức cho placement.

```text
id, placement_id UNIQUE, mentor_score, lecturer_score,
compliance_score, component_breakdown JSONB,
final_score, result_status, decided_by_user_id,
published_at, appeal JSONB, finalized_at, version
```

Appeal JSONB chỉ phù hợp nếu mỗi kết quả có tối đa một quy trình phúc khảo đơn giản. Nếu cho phép nhiều lần hoặc hội đồng nhiều bước, dùng `internship_cases`.

### 5.8 `internship_cases`

Gom các nghiệp vụ ngoại lệ trước đây thành một bảng có loại case:

```text
id, placement_id, case_type, reported_by_user_id,
assigned_to_user_id, status, severity,
summary, detail JSONB, resolution JSONB,
opened_at, resolved_at, version
```

`case_type` gồm:

- `ATTENDANCE_CORRECTION`
- `ATTENDANCE_DISPUTE`
- `SCHEDULE_CHANGE`
- `INCIDENT`
- `TRANSFER_REQUEST`
- `EARLY_TERMINATION`
- `RESULT_APPEAL`

Các cột chung giữ quan hệ; `detail` và `resolution` JSONB chứa dữ liệu khác nhau theo từng loại. Đây là cách dùng JSONB giúp giảm nhiều bảng nhưng vẫn giữ đúng lifecycle của case.

### 5.9 `state_history`

Ghi mọi chuyển trạng thái quan trọng:

```text
id, entity_type, entity_id, from_state, to_state,
action, actor_user_id, reason, metadata JSONB, created_at
```

State history là append-only, không nhét vào JSON array của từng entity vì sẽ khó audit, phân trang và cập nhật đồng thời.

### 5.10 `notifications`

Lưu thông báo hiển thị trong ứng dụng cho từng người dùng:

```text
id, recipient_user_id, notification_type,
title, message, action_url,
related_entity_type, related_entity_id,
delivery_channels JSONB, delivery_status JSONB,
is_read, read_at, created_at, expires_at
```

Các cột recipient, type, trạng thái đọc và thời gian phải là cột thường để truy vấn nhanh. JSONB chỉ dùng cho phần linh hoạt theo kênh:

```json
{
  "inApp": true,
  "email": true,
  "push": false
}
```

và trạng thái gửi:

```json
{
  "email": {
    "status": "SENT",
    "attempts": 1,
    "sentAt": "..."
  }
}
```

Notification không phải nguồn sự thật nghiệp vụ. Ví dụ, Offer đã được phát hành phải được xác định từ `placement_offers`; notification chỉ báo cho sinh viên rằng sự kiện đó đã xảy ra.

### 5.11 `audit_logs`

Lưu lịch sử hành động bảo mật, quản trị và truy cập dữ liệu:

```text
id, actor_user_id, action, entity_type, entity_id,
request_id, ip_address, user_agent,
result, changed_fields JSONB, metadata JSONB, created_at
```

Các sự kiện điển hình:

- Đăng nhập thành công/thất bại.
- Đổi hoặc reset mật khẩu.
- Khóa/mở tài khoản.
- Import danh sách sinh viên/giảng viên.
- Thay đổi role hoặc quyền.
- Xem/tải tài liệu nhạy cảm.
- Export dữ liệu.
- Admin thay đổi cấu hình hoặc danh mục.

`changed_fields JSONB` chỉ lưu những trường đã thay đổi, ví dụ:

```json
{
  "isActive": {
    "from": true,
    "to": false
  }
}
```

Không lưu password, token, nội dung CV đầy đủ hoặc dữ liệu bí mật trong audit JSON. Audit log là append-only và chỉ actor có quyền kiểm toán mới được xem.

`audit_logs` không thay thế log kỹ thuật. Stack trace, HTTP access log, SQL timing và health metric nên được ghi ra file/stdout rồi thu thập bằng công cụ vận hành, không ghi vào database nghiệp vụ.

## 6. Mô hình Lean đề nghị

### 6.1 Hai mươi sáu bảng cốt lõi

| Nhóm | Bảng |
|---|---|
| Tổ chức và danh tính | `departments`, `academic_programs`, `users` |
| Sinh viên | `student_rosters`, `student_profiles` |
| Doanh nghiệp và kỳ | `companies`, `internship_terms` |
| AI và kỹ năng | `skill_taxonomies`, `student_skills`, `job_skills`, `ai_runs` |
| Tuyển dụng | `job_positions`, `job_applications`, `placement_offers` |
| Thiết lập thực tập | `learning_agreements`, `internship_placements` |
| Thực hiện | `placement_tasks`, `attendance_logs`, `weekly_logbooks`, `documents` |
| Ngoại lệ | `internship_cases` |
| Đánh giá | `rubric_evaluations`, `final_results` |
| Thông báo và lịch sử | `notifications`, `state_history`, `audit_logs` |

### 6.2 Vì sao 26 bảng vẫn là lean

- Sáu bảng địa giới được thay bằng một address JSONB.
- Course và certificate chi tiết được gom vào student profile.
- Interview rounds được gom vào application.
- Agreement amendments được gom vào agreement ở MVP.
- Work schedule được gom vào placement.
- Tám điểm rubric được gom vào một JSONB có schema.
- Nhiều bảng correction/dispute/incident/transfer/termination/appeal được gom thành `internship_cases`.
- Các loại lịch sử AI được gom thành `ai_runs`.
- Không tạo bảng riêng cho từng loại document link.

Mô hình vẫn giữ bảng cho những thứ thật sự có identity, lifecycle, FK và audit.

## 7. Bảo đảm các chức năng hệ thống

| Chức năng | Bảng/cấu trúc đảm nhiệm |
|---|---|
| Import tài khoản và bắt đổi mật khẩu | `student_rosters`, `users` |
| Sáu actor và phân quyền | `users.role`, department/company FK |
| Lọc tin theo Khoa/ngành | `academic_programs`, roster/profile, job target programs |
| Thẩm định doanh nghiệp | `companies`, verification detail JSONB, state history |
| Đăng và duyệt vị trí | `job_positions`, `job_skills`, state history |
| CV và trích xuất kỹ năng | `documents`, `ai_runs`, `student_skills` |
| AI matching trước khi ứng tuyển | `ai_runs`, `student_skills`, `job_skills` |
| Lưu snapshot AI khi nộp đơn | `job_applications.ai_match_detail` |
| Phỏng vấn nhiều vòng | `job_applications.interview_rounds` JSONB |
| Offer | `placement_offers` |
| Learning Agreement ba bên | `learning_agreements`, signature JSONB |
| Placement và phân công Mentor/GVHD | `internship_placements` |
| Mentor giao task | `placement_tasks` |
| Chấm công | `attendance_logs` |
| Nhật ký và minh chứng | `weekly_logbooks`, `documents` |
| Theo dõi tiến độ | task + attendance + logbook + placement aggregates |
| Tranh chấp, chuyển, nghỉ ngang | `internship_cases` |
| Mentor/GVHD đánh giá | `rubric_evaluations` |
| Khoa chốt kết quả | `final_results` |
| Phúc khảo | `internship_cases` hoặc appeal JSONB đơn giản |
| Audit transition | `state_history` |
| Hộp thông báo và trạng thái đã đọc | `notifications` |
| Lịch sử đăng nhập, quản trị và truy cập dữ liệu | `audit_logs` |

## 8. Bảo đảm luồng AI

```text
CV Document
  -> ai_runs(EXTRACTION)
  -> output_result JSONB
  -> Sinh viên xác nhận
  -> student_skills có FK skill_taxonomies

Job Position
  -> job_skills có FK skill_taxonomies

Backend lọc job theo Khoa/ngành/trạng thái
  -> ai_runs(MATCHING)
  -> output_result JSONB chứa rankings và version
  -> job_applications.ai_match_detail lưu snapshot khi ứng tuyển
```

Thiết kế này tách rõ:

- JSONB AI output là kết quả máy sinh có phiên bản.
- `student_skills` là hồ sơ kỹ năng đã được xác nhận.
- `job_skills` là yêu cầu chính thức của vị trí.
- Backend, không phải AI, quyết định vị trí nào được đưa vào tập xếp hạng.

## 9. Quy tắc triển khai JSONB trên PostgreSQL

### 9.1 Luôn quy định kiểu gốc

```sql
CHECK (jsonb_typeof(address) = 'object')
CHECK (jsonb_typeof(aliases) = 'array')
CHECK (jsonb_typeof(criteria_scores) = 'array')
```

Default phải ghi rõ kiểu:

```sql
DEFAULT '{}'::jsonb
DEFAULT '[]'::jsonb
```

### 9.2 Có schema version

Các JSON phức tạp nên chứa:

```json
{
  "schemaVersion": 1,
  "...": "..."
}
```

Điều này giúp migrate dữ liệu khi cấu trúc JSON thay đổi.

### 9.3 Không lưu object không giới hạn

- Giới hạn số interview rounds.
- Giới hạn kích thước AI input/output lưu trong DB.
- File nhị phân lưu ở object storage; database chỉ giữ metadata.
- Raw CV text phải có retention và quyền truy cập.

### 9.4 Chỉ tạo GIN index khi có query thật

Ví dụ có thể index JSONB:

```sql
CREATE INDEX idx_company_address_gin
ON companies USING GIN (address jsonb_path_ops);
```

Không tạo GIN cho mọi cột JSONB vì index lớn và làm chậm ghi.

Nếu một key được lọc thường xuyên, đưa nó thành cột thường hoặc generated column thay vì luôn truy vấn sâu trong JSON.

### 9.5 Cập nhật qua aggregate service

JSONB update thường ghi lại toàn bộ value. Các aggregate có JSON mutable nên có cột `version` để optimistic locking, đặc biệt:

- `job_applications.interview_rounds`
- `learning_agreements.amendments`
- `internship_placements.work_schedule`
- `rubric_evaluations.criteria_scores`

### 9.6 Snapshot không thay thế nguồn sự thật

- `ai_match_detail` là snapshot; skill source of truth nằm ở `student_skills` và `job_skills`.
- Address name trong JSON là snapshot; code là giá trị dùng để so sánh.
- `total_hours_worked` là cache; attendance rows là nguồn để tái tính.
- `final_score` được tính từ evaluation và policy, không lấy tùy ý từ JSON client gửi lên.

## 10. Nguyên tắc cuối cùng

Không hỏi “dữ liệu này có thể nhét vào JSONB không?”. PostgreSQL gần như luôn cho phép làm điều đó.

Hãy hỏi:

> Dữ liệu này có cần được hệ thống nhận diện, liên kết, truy vấn, phê duyệt hoặc kiểm toán độc lập hay không?

- Nếu **có**, dùng bảng hoặc cột quan hệ.
- Nếu **không**, và nó chỉ là một phần nhỏ thuộc bản ghi cha, JSONB là lựa chọn tốt.

Áp dụng nguyên tắc này giúp CTU InternLink giảm gần một nửa số bảng so với mô hình 50 bảng nhưng vẫn giữ đúng toàn trình thực tập, sáu actor, các nghiệp vụ ngoại lệ và AI matching có thể giải thích.
