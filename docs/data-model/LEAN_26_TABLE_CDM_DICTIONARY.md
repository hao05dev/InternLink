# CTU InternLink - Từ điển dữ liệu Lean 26 bảng phục vụ vẽ CDM

> **Phạm vi:** Quản lý toàn trình thực tập doanh nghiệp tích hợp trích xuất kỹ năng và xếp hạng mức phù hợp giữa sinh viên và vị trí thực tập tại Trường Đại học Cần Thơ.
>
> **Trạng thái:** Bản chốt tạm để vẽ CDM/LDM. Đây chưa phải Flyway migration.
>
> **Ký hiệu:** PK = khóa chính; FK = khóa ngoại; 0..1 = không hoặc một; 1 = đúng một; 0..N = không hoặc nhiều.

## 1. Quy ước mô hình

- Dùng `UUID` cho định danh kỹ thuật; mã CTU và mã taxonomy vẫn dùng `VARCHAR`.
- Dữ liệu có identity, lifecycle, FK hoặc cần audit được tách thành bảng.
- JSONB chỉ dùng cho value object, snapshot, cấu hình nhỏ hoặc output AI có phiên bản.
- Mọi bảng có state machine cập nhật qua command/service và ghi `state_history`.
- `audit_logs` là append-only; notification không phải nguồn sự thật nghiệp vụ.
- Hai quan hệ polymorphic (`documents`, `state_history/audit_logs`) phải được backend kiểm tra quyền và tính tồn tại.
- Quan hệ Job–Program đang được triển khai lean bằng JSONB mã ngành. Trên CDM vẫn vẽ M:N và đánh dấu cần validation ở LDM/PDM.

## 2. Danh sách 26 bảng

| # | Table | Tên nghiệp vụ | Mục đích |
|---:|---|---|---|
| 1 | `departments` | Khoa/Đơn vị đào tạo | Quản lý các Khoa/đơn vị thuộc CTU. |
| 2 | `academic_programs` | Ngành/Chương trình đào tạo | Danh mục ngành dùng để quản lý sinh viên và lọc vị trí. |
| 3 | `users` | Tài khoản người dùng | Danh tính đăng nhập và một vai trò chính trong sáu actor. |
| 4 | `student_rosters` | Danh sách sinh viên đủ điều kiện | Danh sách sinh viên do Khoa import cho từng kỳ thực tập. |
| 5 | `student_profiles` | Hồ sơ sinh viên | Hồ sơ học thuật, sở thích và dữ liệu mở rộng của sinh viên. |
| 6 | `companies` | Doanh nghiệp | Hồ sơ doanh nghiệp tiếp nhận sinh viên. |
| 7 | `internship_terms` | Kỳ thực tập | Kỳ/đợt thực tập do Khoa tổ chức. |
| 8 | `skill_taxonomies` | Kỹ năng chuẩn hóa | Từ điển ESCO/O*NET/NACE phục vụ AI và rubric. |
| 9 | `student_skills` | Kỹ năng sinh viên | Liên kết sinh viên với kỹ năng chuẩn hóa. |
| 10 | `job_positions` | Vị trí thực tập | Tin tuyển dụng do doanh nghiệp đăng và Khoa phê duyệt. |
| 11 | `job_skills` | Yêu cầu kỹ năng vị trí | Liên kết vị trí với kỹ năng chuẩn hóa. |
| 12 | `ai_runs` | Lần chạy AI | Lịch sử extraction, embedding và matching có phiên bản. |
| 13 | `job_applications` | Hồ sơ ứng tuyển | Đơn sinh viên ứng tuyển vào một vị trí. |
| 14 | `placement_offers` | Đề nghị tiếp nhận | Offer chính thức phát sinh từ hồ sơ ứng tuyển. |
| 15 | `learning_agreements` | Thỏa thuận học tập ba bên | Cam kết học tập giữa sinh viên, doanh nghiệp và Khoa. |
| 16 | `internship_placements` | Lần thực tập | Aggregate trung tâm của quá trình thực tập thực tế. |
| 17 | `placement_tasks` | Nhiệm vụ thực tập | Task do Mentor giao cho sinh viên. |
| 18 | `attendance_logs` | Phiên chấm công | Một ca check-in/check-out của placement. |
| 19 | `weekly_logbooks` | Nhật ký tuần | Báo cáo tuần, reflection và nhận xét hai lớp. |
| 20 | `documents` | Tài liệu/Minh chứng | Metadata và quyền truy cập CV, agreement, evidence và link. |
| 21 | `internship_cases` | Hồ sơ ngoại lệ | Một quy trình xử lý sửa công, tranh chấp, sự cố, chuyển, nghỉ ngang hoặc phúc khảo. |
| 22 | `rubric_evaluations` | Phiếu đánh giá | Đánh giá giữa kỳ/cuối kỳ của Mentor hoặc GVHD. |
| 23 | `final_results` | Kết quả cuối cùng | Quyết định chính thức của Khoa cho placement. |
| 24 | `notifications` | Thông báo người dùng | Hộp thông báo trong ứng dụng và trạng thái giao qua các kênh. |
| 25 | `state_history` | Lịch sử chuyển trạng thái | Dấu vết append-only của mọi chuyển trạng thái nghiệp vụ. |
| 26 | `audit_logs` | Nhật ký kiểm toán | Lịch sử đăng nhập, quản trị và truy cập dữ liệu nhạy cảm. |

## 3. Thuộc tính từng bảng

### 3.1 Khoa/Đơn vị đào tạo - `departments`

Quản lý các Khoa/đơn vị thuộc CTU.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh kỹ thuật. |
| `code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Mã đơn vị chính thức. |
| `name` | `VARCHAR(200)` | NOT NULL | Tên Khoa/đơn vị. |
| `contact_email` | `VARCHAR(150)` | NOT NULL | Email liên hệ. |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Trạng thái hoạt động. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |

### 3.2 Ngành/Chương trình đào tạo - `academic_programs`

Danh mục ngành dùng để quản lý sinh viên và lọc vị trí.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh ngành. |
| `department_id` | `UUID` | NOT NULL, FK -> departments.id | Khoa quản lý ngành. |
| `code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Mã ngành/chương trình CTU. |
| `name` | `VARCHAR(200)` | NOT NULL | Tên ngành/chương trình. |
| `degree_level` | `VARCHAR(30)` | NOT NULL, DEFAULT 'UNDERGRADUATE' | Bậc đào tạo. |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Trạng thái sử dụng. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |

### 3.3 Tài khoản người dùng - `users`

Danh tính đăng nhập và một vai trò chính trong sáu actor.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh người dùng. |
| `department_id` | `UUID` | NULL, FK -> departments.id | Đơn vị CTU của sinh viên/GVHD/cán bộ Khoa. |
| `company_id` | `UUID` | NULL, FK -> companies.id | Doanh nghiệp của đại diện/Mentor. |
| `email` | `VARCHAR(150)` | NOT NULL, UNIQUE | Email đăng nhập. |
| `auth_provider` | `VARCHAR(20)` | NOT NULL, DEFAULT 'LOCAL' | LOCAL hoặc GOOGLE. |
| `google_subject` | `VARCHAR(255)` | NULL, UNIQUE | Google `sub` dùng liên kết danh tính ổn định. |
| `email_verified_at` | `TIMESTAMPTZ` | NULL | Thời điểm xác minh email. |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Mật khẩu đã băm. |
| `full_name` | `VARCHAR(150)` | NOT NULL | Họ và tên. |
| `phone_number` | `VARCHAR(20)` | NULL | Số điện thoại. |
| `role` | `VARCHAR(30)` | NOT NULL, CHECK | STUDENT, COMPANY_REP, COMPANY_MENTOR, LECTURER, FACULTY_ADMIN hoặc ADMIN. |
| `must_change_password` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Bắt đổi mật khẩu lần đầu. |
| `password_changed_at` | `TIMESTAMPTZ` | NULL | Lần đổi mật khẩu gần nhất. |
| `last_login_at` | `TIMESTAMPTZ` | NULL | Lần đăng nhập gần nhất. |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Tài khoản hoạt động/bị khóa. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.4 Danh sách sinh viên đủ điều kiện - `student_rosters`

Danh sách sinh viên do Khoa import cho từng kỳ thực tập.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh roster. |
| `term_id` | `UUID` | NOT NULL, FK -> internship_terms.id | Kỳ thực tập. |
| `program_id` | `UUID` | NOT NULL, FK -> academic_programs.id | Ngành học. |
| `student_code` | `VARCHAR(50)` | NOT NULL | Mã số sinh viên. |
| `official_email` | `VARCHAR(150)` | NOT NULL | Email CTU. |
| `full_name` | `VARCHAR(150)` | NOT NULL | Họ tên theo dữ liệu chính thức. |
| `academic_year` | `VARCHAR(20)` | NOT NULL | Khóa học. |
| `eligibility_status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'ELIGIBLE' | ELIGIBLE, NEEDS_REVIEW hoặc INELIGIBLE. |
| `eligibility_note` | `TEXT` | NULL | Lý do/ghi chú điều kiện. |
| `claimed_user_id` | `UUID` | NULL, FK -> users.id | Tài khoản đã nhận roster. |
| `claimed_at` | `TIMESTAMPTZ` | NULL | Thời điểm kích hoạt. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm import. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `unique_key` | `-` | UNIQUE(term_id, student_code) | Một sinh viên có tối đa một roster trong một kỳ. |

### 3.5 Hồ sơ sinh viên - `student_profiles`

Hồ sơ học thuật, sở thích và dữ liệu mở rộng của sinh viên.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `user_id` | `UUID` | PK, FK -> users.id | Sinh viên sở hữu hồ sơ. |
| `program_id` | `UUID` | NOT NULL, FK -> academic_programs.id | Ngành hiện tại. |
| `student_code` | `VARCHAR(50)` | NOT NULL, UNIQUE | MSSV. |
| `gpa` | `NUMERIC(3,2)` | NULL, CHECK 0..4 | GPA hệ 4. |
| `certificates` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Chứng chỉ nhỏ chưa có workflow riêng. |
| `passed_courses` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Học phần đã tích lũy dùng làm feature. |
| `preferences` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Địa điểm, hình thức và lĩnh vực mong muốn. |
| `github_url` | `VARCHAR(255)` | NULL | GitHub/portfolio. |
| `bio` | `TEXT` | NULL | Giới thiệu bản thân. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.6 Doanh nghiệp - `companies`

Hồ sơ doanh nghiệp tiếp nhận sinh viên.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh doanh nghiệp. |
| `company_name` | `VARCHAR(255)` | NOT NULL | Tên doanh nghiệp. |
| `tax_code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Mã số thuế. |
| `industry` | `VARCHAR(100)` | NULL | Lĩnh vực. |
| `website` | `VARCHAR(255)` | NULL | Website. |
| `address` | `JSONB` | NOT NULL | Địa chỉ gồm code và tên snapshot. |
| `verification_status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PENDING' | PENDING, NEEDS_REVISION, VERIFIED hoặc REJECTED. |
| `verification_detail` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Checklist và snapshot thẩm định. |
| `verified_by_user_id` | `UUID` | NULL, FK -> users.id | Cán bộ Khoa thẩm định. |
| `verified_at` | `TIMESTAMPTZ` | NULL | Thời điểm thẩm định. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.7 Kỳ thực tập - `internship_terms`

Kỳ/đợt thực tập do Khoa tổ chức.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh kỳ. |
| `department_id` | `UUID` | NOT NULL, FK -> departments.id | Khoa tổ chức. |
| `code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Mã kỳ. |
| `term_name` | `VARCHAR(150)` | NOT NULL | Tên kỳ. |
| `academic_year` | `VARCHAR(20)` | NOT NULL | Năm học, ví dụ 2026-2027. |
| `semester` | `VARCHAR(20)` | NOT NULL | Học kỳ, ví dụ HK1, HK2 hoặc HÈ. |
| `registration_open_at` | `TIMESTAMPTZ` | NOT NULL | Bắt đầu tiếp nhận/đối chiếu sinh viên tham gia. |
| `registration_close_at` | `TIMESTAMPTZ` | NOT NULL | Kết thúc đăng ký kỳ. |
| `start_date` | `DATE` | NOT NULL | Ngày bắt đầu. |
| `end_date` | `DATE` | NOT NULL | Ngày kết thúc. |
| `application_deadline` | `TIMESTAMPTZ` | NOT NULL | Hạn nộp đơn. |
| `evaluation_deadline` | `TIMESTAMPTZ` | NOT NULL | Hạn hoàn tất đánh giá cuối kỳ. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'DRAFT' | DRAFT, REGISTRATION_OPEN, APPLICATION_OPEN, ACTIVE, EVALUATING hoặc CLOSED. |
| `settings` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Số giờ yêu cầu, giới hạn đơn, hạn phúc khảo. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.8 Kỹ năng chuẩn hóa - `skill_taxonomies`

Từ điển ESCO/O*NET/NACE phục vụ AI và rubric.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `VARCHAR(50)` | PK | Mã kỹ năng ổn định. |
| `skill_name` | `VARCHAR(150)` | NOT NULL | Tên chuẩn hóa. |
| `category` | `VARCHAR(50)` | NOT NULL | TECHNICAL, SOFT_SKILL hoặc NACE. |
| `framework` | `VARCHAR(50)` | NOT NULL, DEFAULT 'ESCO' | Nguồn taxonomy. |
| `description` | `TEXT` | NULL | Mô tả. |
| `aliases` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Tên đồng nghĩa. |
| `taxonomy_version` | `VARCHAR(50)` | NOT NULL | Phiên bản taxonomy. |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Còn sử dụng. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |

### 3.9 Kỹ năng sinh viên - `student_skills`

Liên kết sinh viên với kỹ năng chuẩn hóa.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `student_id` | `UUID` | PK(1), FK -> users.id | Sinh viên. |
| `skill_id` | `VARCHAR(50)` | PK(2), FK -> skill_taxonomies.id | Kỹ năng. |
| `source` | `VARCHAR(30)` | NOT NULL | CV_AI, STUDENT_DECLARED, COURSE hoặc CERTIFICATE. |
| `proficiency_level` | `VARCHAR(30)` | NULL | Mức thành thạo. |
| `confidence` | `NUMERIC(5,4)` | NULL, CHECK 0..1 | Độ tin cậy AI. |
| `is_confirmed` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Sinh viên/nguồn có thẩm quyền đã xác nhận. |
| `evidence_document_id` | `UUID` | NULL, FK -> documents.id | Minh chứng. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |

### 3.10 Vị trí thực tập - `job_positions`

Tin tuyển dụng do doanh nghiệp đăng và Khoa phê duyệt.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh vị trí. |
| `company_id` | `UUID` | NOT NULL, FK -> companies.id | Doanh nghiệp đăng. |
| `term_id` | `UUID` | NOT NULL, FK -> internship_terms.id | Kỳ áp dụng. |
| `department_id` | `UUID` | NOT NULL, FK -> departments.id | Khoa thẩm định. |
| `title` | `VARCHAR(255)` | NOT NULL | Tên vị trí. |
| `work_format` | `VARCHAR(30)` | NOT NULL | ONSITE, HYBRID hoặc REMOTE. |
| `location` | `VARCHAR(255)` | NOT NULL | Địa điểm làm việc. |
| `vacancies` | `INT` | NOT NULL, DEFAULT 1, CHECK > 0 | Chỉ tiêu. |
| `description` | `TEXT` | NOT NULL | Mô tả công việc. |
| `target_program_codes` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Mã ngành mục tiêu; logical M:N với academic_programs. |
| `target_learning_outcomes` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Chuẩn đầu ra dự kiến. |
| `benefits` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Phúc lợi. |
| `stipend_amount` | `NUMERIC(12,2)` | NULL, CHECK >= 0 | Phụ cấp. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'DRAFT' | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED hoặc CLOSED. |
| `faculty_feedback` | `TEXT` | NULL | Ý kiến Khoa. |
| `approved_by_user_id` | `UUID` | NULL, FK -> users.id | Cán bộ phê duyệt. |
| `approved_at` | `TIMESTAMPTZ` | NULL | Thời điểm phê duyệt. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.11 Yêu cầu kỹ năng vị trí - `job_skills`

Liên kết vị trí với kỹ năng chuẩn hóa.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `job_id` | `UUID` | PK(1), FK -> job_positions.id | Vị trí. |
| `skill_id` | `VARCHAR(50)` | PK(2), FK -> skill_taxonomies.id | Kỹ năng. |
| `requirement_type` | `VARCHAR(20)` | NOT NULL | MANDATORY hoặc OPTIONAL. |
| `required_level` | `VARCHAR(30)` | NULL | Mức yêu cầu. |
| `weight` | `NUMERIC(5,4)` | NOT NULL, DEFAULT 1, CHECK > 0 | Trọng số matching. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |

### 3.12 Lần chạy AI - `ai_runs`

Lịch sử extraction, embedding và matching có phiên bản.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh run. |
| `run_type` | `VARCHAR(30)` | NOT NULL | CV_EXTRACTION, JOB_EXTRACTION, EMBEDDING hoặc MATCHING. |
| `student_id` | `UUID` | NULL, FK -> users.id | Sinh viên liên quan. |
| `source_document_id` | `UUID` | NULL, FK -> documents.id | CV/tài liệu nguồn. |
| `job_id` | `UUID` | NULL, FK -> job_positions.id | Vị trí nguồn nếu phân tích job. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PENDING' | PENDING, RUNNING, COMPLETED hoặc FAILED. |
| `model_name` | `VARCHAR(100)` | NOT NULL | Tên model. |
| `model_version` | `VARCHAR(100)` | NULL | Phiên bản model. |
| `taxonomy_version` | `VARCHAR(50)` | NULL | Phiên bản taxonomy. |
| `input_hash` | `VARCHAR(128)` | NOT NULL | Hash input để chống kết quả cũ. |
| `input_snapshot` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Feature/input đã tối thiểu hóa. |
| `output_result` | `JSONB` | NULL | Kết quả extraction/ranking. |
| `error_detail` | `JSONB` | NULL | Lỗi đã lọc dữ liệu nhạy cảm. |
| `started_at` | `TIMESTAMPTZ` | NULL | Bắt đầu chạy. |
| `completed_at` | `TIMESTAMPTZ` | NULL | Kết thúc. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |

### 3.13 Hồ sơ ứng tuyển - `job_applications`

Đơn sinh viên ứng tuyển vào một vị trí.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh đơn. |
| `job_id` | `UUID` | NOT NULL, FK -> job_positions.id | Vị trí. |
| `student_id` | `UUID` | NOT NULL, FK -> users.id | Sinh viên. |
| `submitted_cv_document_id` | `UUID` | NOT NULL, FK -> documents.id | CV snapshot khi nộp. |
| `matching_ai_run_id` | `UUID` | NULL, FK -> ai_runs.id | Run matching dùng khi ứng tuyển. |
| `cover_letter` | `TEXT` | NULL | Thư nguyện vọng. |
| `ai_match_detail` | `JSONB` | NULL | Snapshot điểm và giải thích AI. |
| `interview_rounds` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Các vòng phỏng vấn nhỏ, thuộc application. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'SUBMITTED' | SUBMITTED, REVIEWING, INTERVIEWING, OFFERED, REJECTED hoặc WITHDRAWN. |
| `submitted_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm nộp. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |
| `unique_key` | `-` | UNIQUE(job_id, student_id) | Không nộp trùng cùng vị trí. |

### 3.14 Đề nghị tiếp nhận - `placement_offers`

Offer chính thức phát sinh từ hồ sơ ứng tuyển.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh offer. |
| `application_id` | `UUID` | NOT NULL, UNIQUE, FK -> job_applications.id | Application được chọn. |
| `proposed_mentor_id` | `UUID` | NULL, FK -> users.id | Mentor dự kiến. |
| `start_date` | `DATE` | NOT NULL | Ngày bắt đầu dự kiến. |
| `end_date` | `DATE` | NOT NULL | Ngày kết thúc dự kiến. |
| `stipend` | `NUMERIC(12,2)` | NULL, CHECK >= 0 | Phụ cấp chính thức. |
| `terms_snapshot` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Điều kiện làm việc/phúc lợi tại lúc phát hành. |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Hạn phản hồi. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'SENT' | SENT, ACCEPTED, DECLINED, EXPIRED hoặc WITHDRAWN. |
| `responded_at` | `TIMESTAMPTZ` | NULL | Thời điểm phản hồi. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm phát hành. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.15 Thỏa thuận học tập ba bên - `learning_agreements`

Cam kết học tập giữa sinh viên, doanh nghiệp và Khoa.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh agreement. |
| `offer_id` | `UUID` | NOT NULL, UNIQUE, FK -> placement_offers.id | Offer đã chấp nhận. |
| `student_id` | `UUID` | NOT NULL, FK -> users.id | Sinh viên. |
| `company_id` | `UUID` | NOT NULL, FK -> companies.id | Doanh nghiệp. |
| `department_id` | `UUID` | NOT NULL, FK -> departments.id | Khoa. |
| `target_credits` | `INT` | NOT NULL, CHECK > 0 | Số tín chỉ CTU. |
| `learning_objectives` | `TEXT` | NOT NULL | Mục tiêu và nhiệm vụ học tập. |
| `status` | `VARCHAR(40)` | NOT NULL, DEFAULT 'DRAFT' | DRAFT, PENDING_SIGNATURES, APPROVED, REVISION_REQUESTED hoặc CANCELLED. |
| `student_signature` | `JSONB` | NULL | Chữ ký sinh viên và document hash. |
| `company_signature` | `JSONB` | NULL | Chữ ký đại diện doanh nghiệp. |
| `faculty_signature` | `JSONB` | NULL | Phê duyệt của Khoa. |
| `amendments` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Phụ lục nhỏ dạng append-only. |
| `document_id` | `UUID` | NULL, FK -> documents.id | Bản tài liệu agreement. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.16 Lần thực tập - `internship_placements`

Aggregate trung tâm của quá trình thực tập thực tế.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh placement. |
| `agreement_id` | `UUID` | NOT NULL, UNIQUE, FK -> learning_agreements.id | Agreement kích hoạt placement. |
| `student_id` | `UUID` | NOT NULL, FK -> users.id | Sinh viên. |
| `company_id` | `UUID` | NOT NULL, FK -> companies.id | Doanh nghiệp tiếp nhận. |
| `mentor_id` | `UUID` | NOT NULL, FK -> users.id | Mentor doanh nghiệp. |
| `lecturer_id` | `UUID` | NOT NULL, FK -> users.id | GVHD. |
| `term_id` | `UUID` | NOT NULL, FK -> internship_terms.id | Kỳ thực tập. |
| `work_schedule` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Lịch tuần và phiên bản hiệu lực. |
| `start_date` | `DATE` | NOT NULL | Ngày bắt đầu. |
| `end_date` | `DATE` | NOT NULL | Ngày kết thúc dự kiến/thực tế. |
| `total_hours_worked` | `NUMERIC(7,2)` | NOT NULL, DEFAULT 0 | Cache tổng giờ từ attendance. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PREPARING' | PREPARING, ACTIVE, PAUSED, COMPLETED, TERMINATED hoặc TRANSFERRED. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.17 Nhiệm vụ thực tập - `placement_tasks`

Task do Mentor giao cho sinh viên.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh task. |
| `placement_id` | `UUID` | NOT NULL, FK -> internship_placements.id | Placement. |
| `assigned_by_mentor_id` | `UUID` | NOT NULL, FK -> users.id | Mentor giao task. |
| `title` | `VARCHAR(255)` | NOT NULL | Tên task. |
| `description` | `TEXT` | NOT NULL | Yêu cầu thực hiện. |
| `learning_outcomes` | `JSONB` | NOT NULL, DEFAULT '[]'::jsonb | Outcome liên quan. |
| `due_at` | `TIMESTAMPTZ` | NULL | Hạn hoàn thành. |
| `progress_percent` | `INT` | NOT NULL, DEFAULT 0, CHECK 0..100 | Tiến độ. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'ASSIGNED' | ASSIGNED, IN_PROGRESS, SUBMITTED, REVISION_REQUIRED, COMPLETED hoặc CANCELLED. |
| `submission_summary` | `TEXT` | NULL | Tóm tắt kết quả nộp. |
| `mentor_feedback` | `TEXT` | NULL | Phản hồi Mentor. |
| `submitted_at` | `TIMESTAMPTZ` | NULL | Thời điểm nộp. |
| `reviewed_at` | `TIMESTAMPTZ` | NULL | Thời điểm review. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm giao. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.18 Phiên chấm công - `attendance_logs`

Một ca check-in/check-out của placement.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh ca. |
| `placement_id` | `UUID` | NOT NULL, FK -> internship_placements.id | Placement. |
| `work_date` | `DATE` | NOT NULL | Ngày làm việc. |
| `check_in_at` | `TIMESTAMPTZ` | NOT NULL | Check-in. |
| `check_out_at` | `TIMESTAMPTZ` | NULL | Check-out. |
| `duration_hours` | `NUMERIC(5,2)` | NULL, CHECK >= 0 | Số giờ được tính. |
| `work_format` | `VARCHAR(30)` | NOT NULL | ONSITE, HYBRID hoặc REMOTE. |
| `check_in_location` | `JSONB` | NULL | Tọa độ, accuracy và capturedAt. |
| `check_out_location` | `JSONB` | NULL | Tọa độ, accuracy và capturedAt. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'OPEN' | OPEN, PENDING_CONFIRMATION, CONFIRMED, REJECTED hoặc DISPUTED. |
| `confirmed_by_user_id` | `UUID` | NULL, FK -> users.id | Mentor xác nhận. |
| `confirmed_at` | `TIMESTAMPTZ` | NULL | Thời điểm xác nhận. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.19 Nhật ký tuần - `weekly_logbooks`

Báo cáo tuần, reflection và nhận xét hai lớp.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh nhật ký. |
| `placement_id` | `UUID` | NOT NULL, FK -> internship_placements.id | Placement. |
| `week_number` | `INT` | NOT NULL, CHECK > 0 | Tuần số. |
| `period_start` | `DATE` | NOT NULL | Đầu tuần. |
| `period_end` | `DATE` | NOT NULL | Cuối tuần. |
| `tasks_completed` | `TEXT` | NOT NULL | Công việc đã làm. |
| `learning_reflection` | `TEXT` | NOT NULL | Bài học và tự nhận xét. |
| `total_hours` | `NUMERIC(5,2)` | NOT NULL, CHECK >= 0 | Tổng giờ tuần. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'DRAFT' | DRAFT, SUBMITTED, APPROVED_BY_MENTOR hoặc REVISION_REQUESTED. |
| `mentor_feedback` | `TEXT` | NULL | Nhận xét công việc. |
| `mentor_reviewed_by` | `UUID` | NULL, FK -> users.id | Mentor review. |
| `mentor_reviewed_at` | `TIMESTAMPTZ` | NULL | Thời điểm review. |
| `lecturer_comment` | `TEXT` | NULL | Nhận xét học thuật. |
| `lecturer_commented_by` | `UUID` | NULL, FK -> users.id | GVHD nhận xét. |
| `lecturer_commented_at` | `TIMESTAMPTZ` | NULL | Thời điểm nhận xét. |
| `submitted_at` | `TIMESTAMPTZ` | NULL | Thời điểm nộp. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |
| `unique_key` | `-` | UNIQUE(placement_id, week_number) | Một nhật ký mỗi tuần. |

### 3.20 Tài liệu/Minh chứng - `documents`

Metadata và quyền truy cập CV, agreement, evidence và link.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh tài liệu. |
| `owner_user_id` | `UUID` | NOT NULL, FK -> users.id | Người sở hữu/tải lên. |
| `context_type` | `VARCHAR(40)` | NOT NULL | PROFILE, APPLICATION, AGREEMENT, PLACEMENT, TASK, LOGBOOK, EVALUATION hoặc CASE. |
| `context_id` | `UUID` | NOT NULL | ID aggregate liên quan; polymorphic do backend kiểm soát. |
| `document_type` | `VARCHAR(40)` | NOT NULL | CV, AGREEMENT, EVIDENCE, CERTIFICATE, REPORT hoặc EXTERNAL_LINK. |
| `storage_provider` | `VARCHAR(30)` | NOT NULL, DEFAULT 'GOOGLE_DRIVE' | Nhà cung cấp lưu trữ. |
| `provider_file_id` | `VARCHAR(255)` | NULL, UNIQUE | Google Drive fileId hoặc ID tương đương. |
| `provider_folder_id` | `VARCHAR(255)` | NULL | Thư mục trên nhà cung cấp. |
| `external_url` | `TEXT` | NULL | Link ngoài khi document type là EXTERNAL_LINK. |
| `original_name` | `VARCHAR(255)` | NULL | Tên file gốc. |
| `mime_type` | `VARCHAR(100)` | NULL | MIME type. |
| `size_bytes` | `BIGINT` | NULL, CHECK >= 0 | Kích thước. |
| `checksum` | `VARCHAR(128)` | NULL | Hash kiểm tra toàn vẹn. |
| `visibility` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PRIVATE' | PRIVATE, PLACEMENT_PARTIES hoặc FACULTY. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'UPLOADING' | UPLOADING, ACTIVE, FAILED, QUARANTINED hoặc DELETED. |
| `version_number` | `INT` | NOT NULL, DEFAULT 1, CHECK > 0 | Số phiên bản của tài liệu cùng loại/ngữ cảnh. |
| `is_current` | `BOOLEAN` | NOT NULL, DEFAULT TRUE | Đánh dấu phiên bản hiện hành; CV hiện hành được truy vấn từ đây thay vì tạo FK ngược về profile. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `deleted_at` | `TIMESTAMPTZ` | NULL | Soft delete. |

### 3.21 Hồ sơ ngoại lệ - `internship_cases`

Một quy trình xử lý sửa công, tranh chấp, sự cố, chuyển, nghỉ ngang hoặc phúc khảo.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh case. |
| `placement_id` | `UUID` | NOT NULL, FK -> internship_placements.id | Placement liên quan. |
| `case_type` | `VARCHAR(40)` | NOT NULL | ATTENDANCE_CORRECTION, ATTENDANCE_DISPUTE, SCHEDULE_CHANGE, INCIDENT, TRANSFER_REQUEST, EARLY_TERMINATION hoặc RESULT_APPEAL. |
| `reported_by_user_id` | `UUID` | NOT NULL, FK -> users.id | Người báo cáo. |
| `assigned_to_user_id` | `UUID` | NULL, FK -> users.id | Người xử lý. |
| `related_entity_type` | `VARCHAR(40)` | NULL | Loại đối tượng cụ thể như ATTENDANCE hoặc FINAL_RESULT. |
| `related_entity_id` | `UUID` | NULL | ID đối tượng cụ thể. |
| `severity` | `VARCHAR(20)` | NOT NULL, DEFAULT 'NORMAL' | LOW, NORMAL, HIGH hoặc CRITICAL. |
| `summary` | `TEXT` | NOT NULL | Tóm tắt. |
| `detail` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Dữ liệu riêng theo loại case. |
| `resolution` | `JSONB` | NULL | Quyết định và biện pháp xử lý. |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'OPEN' | OPEN, INVESTIGATING, WAITING_INFORMATION, RESOLVED hoặc REJECTED. |
| `opened_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm mở. |
| `resolved_at` | `TIMESTAMPTZ` | NULL | Thời điểm kết thúc. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.22 Phiếu đánh giá - `rubric_evaluations`

Đánh giá giữa kỳ/cuối kỳ của Mentor hoặc GVHD.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh phiếu. |
| `placement_id` | `UUID` | NOT NULL, FK -> internship_placements.id | Placement. |
| `evaluator_id` | `UUID` | NOT NULL, FK -> users.id | Người đánh giá. |
| `evaluator_role` | `VARCHAR(30)` | NOT NULL | COMPANY_MENTOR hoặc LECTURER. |
| `evaluation_stage` | `VARCHAR(20)` | NOT NULL | MIDTERM hoặc FINAL. |
| `rubric_version` | `VARCHAR(50)` | NOT NULL | Phiên bản rubric. |
| `criteria_scores` | `JSONB` | NOT NULL | Tám tiêu chí NACE gồm competencyId, score, weight, comment. |
| `final_score` | `NUMERIC(5,2)` | NOT NULL, CHECK 0..10 | Điểm phiếu do backend tính. |
| `qualitative_feedback` | `TEXT` | NULL | Nhận xét. |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'DRAFT' | DRAFT hoặc SUBMITTED. |
| `submitted_at` | `TIMESTAMPTZ` | NULL | Thời điểm nộp. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |
| `unique_key` | `-` | UNIQUE(placement_id, evaluator_id, evaluation_stage) | Một người chấm một phiếu mỗi giai đoạn. |

### 3.23 Kết quả cuối cùng - `final_results`

Quyết định chính thức của Khoa cho placement.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh kết quả. |
| `placement_id` | `UUID` | NOT NULL, UNIQUE, FK -> internship_placements.id | Placement. |
| `mentor_score` | `NUMERIC(5,2)` | NULL, CHECK 0..10 | Điểm Mentor. |
| `lecturer_score` | `NUMERIC(5,2)` | NULL, CHECK 0..10 | Điểm GVHD. |
| `compliance_score` | `NUMERIC(5,2)` | NULL, CHECK 0..10 | Điểm tuân thủ nếu áp dụng. |
| `component_breakdown` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Trọng số và thành phần tính điểm. |
| `final_score` | `NUMERIC(5,2)` | NULL, CHECK 0..10 | Điểm cuối. |
| `result_status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'PENDING_REVIEW' | PENDING_REVIEW, PASSED, FAILED hoặc NOT_COMPLETED. |
| `decided_by_user_id` | `UUID` | NULL, FK -> users.id | Cán bộ Khoa chốt. |
| `published_at` | `TIMESTAMPTZ` | NULL | Thời điểm công bố. |
| `finalized_at` | `TIMESTAMPTZ` | NULL | Thời điểm hết/đã xử lý phúc khảo. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm cập nhật. |
| `version` | `INT` | NOT NULL, DEFAULT 0 | Optimistic locking. |

### 3.24 Thông báo người dùng - `notifications`

Hộp thông báo trong ứng dụng và trạng thái giao qua các kênh.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh thông báo. |
| `recipient_user_id` | `UUID` | NOT NULL, FK -> users.id | Người nhận. |
| `notification_type` | `VARCHAR(50)` | NOT NULL | Loại sự kiện. |
| `title` | `VARCHAR(255)` | NOT NULL | Tiêu đề. |
| `message` | `TEXT` | NOT NULL | Nội dung. |
| `action_url` | `TEXT` | NULL | Đường dẫn hành động. |
| `related_entity_type` | `VARCHAR(40)` | NULL | Loại aggregate nguồn. |
| `related_entity_id` | `UUID` | NULL | ID aggregate nguồn. |
| `delivery_channels` | `JSONB` | NOT NULL, DEFAULT '{"inApp":true}'::jsonb | Kênh in-app/email/push. |
| `delivery_status` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Trạng thái và số lần gửi từng kênh. |
| `is_read` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | Đã đọc. |
| `read_at` | `TIMESTAMPTZ` | NULL | Thời điểm đọc. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm tạo. |
| `expires_at` | `TIMESTAMPTZ` | NULL | Thời điểm hết hạn hiển thị. |

### 3.25 Lịch sử chuyển trạng thái - `state_history`

Dấu vết append-only của mọi chuyển trạng thái nghiệp vụ.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh history. |
| `entity_type` | `VARCHAR(40)` | NOT NULL | Loại aggregate. |
| `entity_id` | `UUID` | NOT NULL | ID aggregate. |
| `from_state` | `VARCHAR(50)` | NULL | Trạng thái trước. |
| `to_state` | `VARCHAR(50)` | NOT NULL | Trạng thái sau. |
| `action` | `VARCHAR(80)` | NOT NULL | Command gây chuyển trạng thái. |
| `actor_user_id` | `UUID` | NULL, FK -> users.id | Người thực hiện; NULL nếu hệ thống/timer. |
| `reason` | `TEXT` | NULL | Lý do. |
| `metadata` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Ngữ cảnh không nhạy cảm. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm chuyển. |

### 3.26 Nhật ký kiểm toán - `audit_logs`

Lịch sử đăng nhập, quản trị và truy cập dữ liệu nhạy cảm.

| Thuộc tính | Kiểu dữ liệu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Định danh audit. |
| `actor_user_id` | `UUID` | NULL, FK -> users.id | Người thực hiện; NULL cho anonymous/system. |
| `action` | `VARCHAR(100)` | NOT NULL | Hành động kiểm toán. |
| `entity_type` | `VARCHAR(40)` | NULL | Loại đối tượng. |
| `entity_id` | `UUID` | NULL | ID đối tượng. |
| `request_id` | `VARCHAR(100)` | NULL | Correlation ID. |
| `ip_address` | `INET` | NULL | Địa chỉ IP. |
| `user_agent` | `TEXT` | NULL | User agent. |
| `result` | `VARCHAR(20)` | NOT NULL | SUCCESS hoặc FAILURE. |
| `changed_fields` | `JSONB` | NULL | Các trường trước/sau đã lọc bí mật. |
| `metadata` | `JSONB` | NOT NULL, DEFAULT '{}'::jsonb | Ngữ cảnh kiểm toán không nhạy cảm. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Thời điểm sự kiện. |

## 4. Catalog liên kết để vẽ CDM

> Cách đọc: phía A có cardinality A và phía B có cardinality B trong một occurrence của quan hệ. Khi vẽ Crow's Foot, đặt đúng cardinality ở hai đầu và dùng cột “Tên liên kết” làm nhãn.

| Thực thể A | Tên liên kết | Thực thể B | A | B | Giải thích |
|---|---|---|---:|---:|---|
| `departments` | **quản lý** | `academic_programs` | 1 | 0..N | Một ngành thuộc đúng một Khoa. |
| `departments` | **có thành viên CTU** | `users` | 0..1 | 0..N | User CTU có thể thuộc một Khoa; user doanh nghiệp/Admin có thể không thuộc Khoa. |
| `companies` | **có thành viên doanh nghiệp** | `users` | 0..1 | 0..N | Đại diện/Mentor thuộc tối đa một doanh nghiệp trong MVP. |
| `internship_terms` | **bao gồm sinh viên đủ điều kiện** | `student_rosters` | 1 | 0..N | Mỗi roster thuộc đúng một kỳ. |
| `academic_programs` | **phân loại sinh viên trong roster** | `student_rosters` | 1 | 0..N | Mỗi roster thuộc đúng một ngành. |
| `users` | **nhận/kích hoạt roster** | `student_rosters` | 0..1 | 0..N | Roster có thể chưa được claim; một user có thể tham gia nhiều kỳ. |
| `users` | **có hồ sơ sinh viên** | `student_profiles` | 1 | 0..1 | Chỉ user STUDENT có profile. |
| `academic_programs` | **là ngành hiện tại của** | `student_profiles` | 1 | 0..N | Mỗi profile thuộc một ngành. |
| `users` | **sở hữu kỹ năng** | `student_skills` | 1 | 0..N | Mỗi student skill thuộc một sinh viên. |
| `skill_taxonomies` | **được sinh viên sở hữu** | `student_skills` | 1 | 0..N | Liên kết M:N User–Skill qua student_skills. |
| `documents` | **minh chứng cho kỹ năng** | `student_skills` | 0..1 | 0..N | Một skill có thể không có hoặc có một document evidence. |
| `departments` | **tổ chức** | `internship_terms` | 1 | 0..N | Mỗi kỳ do một Khoa tổ chức. |
| `companies` | **đăng tuyển** | `job_positions` | 1 | 0..N | Mỗi vị trí thuộc một doanh nghiệp. |
| `internship_terms` | **áp dụng cho** | `job_positions` | 1 | 0..N | Mỗi vị trí thuộc một kỳ. |
| `departments` | **thẩm định** | `job_positions` | 1 | 0..N | Mỗi vị trí do một Khoa quản lý. |
| `academic_programs` | **là ngành mục tiêu của** | `job_positions` | 0..N | 0..N | Quan hệ logical M:N, triển khai lean bằng target_program_codes JSONB. |
| `job_positions` | **yêu cầu** | `job_skills` | 1 | 0..N | Một vị trí có nhiều yêu cầu kỹ năng. |
| `skill_taxonomies` | **được yêu cầu bởi** | `job_skills` | 1 | 0..N | Liên kết M:N Job–Skill qua job_skills. |
| `users` | **có lần chạy AI** | `ai_runs` | 0..1 | 0..N | AI run có thể gắn sinh viên hoặc là job/system run. |
| `documents` | **là nguồn của** | `ai_runs` | 0..1 | 0..N | CV/document có thể được phân tích nhiều lần. |
| `job_positions` | **được AI phân tích** | `ai_runs` | 0..1 | 0..N | Job có thể có nhiều run theo phiên bản. |
| `users` | **nộp** | `job_applications` | 1 | 0..N | Mỗi application thuộc một sinh viên. |
| `job_positions` | **nhận** | `job_applications` | 1 | 0..N | Mỗi application nhắm một vị trí. |
| `documents` | **là CV nộp kèm** | `job_applications` | 1 | 0..N | Một CV document có thể dùng cho nhiều đơn. |
| `ai_runs` | **cung cấp snapshot matching cho** | `job_applications` | 0..1 | 0..N | Application có thể tham chiếu matching run đã dùng. |
| `job_applications` | **phát sinh** | `placement_offers` | 1 | 0..1 | Mỗi application có tối đa một offer trong MVP. |
| `users` | **được đề xuất làm Mentor trong** | `placement_offers` | 0..1 | 0..N | Offer có thể chưa chỉ định Mentor. |
| `placement_offers` | **chuyển thành** | `learning_agreements` | 1 | 0..1 | Offer được chấp nhận có tối đa một agreement. |
| `users` | **tham gia với vai trò sinh viên** | `learning_agreements` | 1 | 0..N | Mỗi agreement có một sinh viên. |
| `companies` | **tham gia** | `learning_agreements` | 1 | 0..N | Mỗi agreement có một doanh nghiệp. |
| `departments` | **phê duyệt** | `learning_agreements` | 1 | 0..N | Mỗi agreement thuộc một Khoa. |
| `documents` | **biểu diễn bản ký của** | `learning_agreements` | 0..1 | 0..N | Agreement có thể có document chính thức. |
| `learning_agreements` | **kích hoạt** | `internship_placements` | 1 | 0..1 | Một agreement có tối đa một placement. |
| `users` | **thực tập trong** | `internship_placements` | 1 | 0..N | Quan hệ qua student_id; mỗi placement có một sinh viên. |
| `companies` | **tiếp nhận** | `internship_placements` | 1 | 0..N | Mỗi placement thuộc một doanh nghiệp. |
| `users` | **hướng dẫn doanh nghiệp** | `internship_placements` | 1 | 0..N | Quan hệ qua mentor_id. |
| `users` | **hướng dẫn học thuật** | `internship_placements` | 1 | 0..N | Quan hệ qua lecturer_id. |
| `internship_terms` | **quản lý** | `internship_placements` | 1 | 0..N | Mỗi placement thuộc một kỳ. |
| `internship_placements` | **bao gồm** | `placement_tasks` | 1 | 0..N | Placement có nhiều task. |
| `users` | **giao** | `placement_tasks` | 1 | 0..N | Mỗi task do một Mentor giao. |
| `internship_placements` | **ghi nhận** | `attendance_logs` | 1 | 0..N | Placement có nhiều phiên chấm công. |
| `users` | **xác nhận** | `attendance_logs` | 0..1 | 0..N | Phiên công có thể chưa được Mentor xác nhận. |
| `internship_placements` | **có** | `weekly_logbooks` | 1 | 0..N | Placement có tối đa một logbook mỗi tuần. |
| `users` | **duyệt thực tế** | `weekly_logbooks` | 0..1 | 0..N | Mentor có thể chưa review. |
| `users` | **nhận xét học thuật** | `weekly_logbooks` | 0..1 | 0..N | GVHD có thể chưa nhận xét. |
| `users` | **sở hữu/tải lên** | `documents` | 1 | 0..N | Mỗi document có một owner. |
| `documents` | **đính kèm cho aggregate** | `các aggregate nghiệp vụ` | 1 | 1 | Quan hệ polymorphic qua context_type/context_id; backend kiểm soát. |
| `internship_placements` | **phát sinh** | `internship_cases` | 1 | 0..N | Placement có nhiều case ngoại lệ. |
| `users` | **báo cáo** | `internship_cases` | 1 | 0..N | Mỗi case có một reporter. |
| `users` | **xử lý** | `internship_cases` | 0..1 | 0..N | Case có thể chưa được phân công. |
| `internship_placements` | **được đánh giá bằng** | `rubric_evaluations` | 1 | 0..N | Placement có nhiều phiếu theo evaluator/stage. |
| `users` | **thực hiện đánh giá** | `rubric_evaluations` | 1 | 0..N | Evaluator là Mentor hoặc GVHD. |
| `internship_placements` | **có kết quả cuối** | `final_results` | 1 | 0..1 | Mỗi placement có tối đa một kết quả chính thức. |
| `users` | **quyết định** | `final_results` | 0..1 | 0..N | Kết quả có thể chưa được Khoa chốt. |
| `users` | **nhận** | `notifications` | 1 | 0..N | Mỗi notification có một người nhận. |
| `users` | **thực hiện chuyển trạng thái** | `state_history` | 0..1 | 0..N | Actor có thể NULL khi timer/hệ thống thực hiện. |
| `state_history` | **ghi lịch sử cho** | `các aggregate nghiệp vụ` | 0..N | 1 | Quan hệ polymorphic qua entity_type/entity_id. |
| `users` | **thực hiện hành động audit** | `audit_logs` | 0..1 | 0..N | Actor có thể anonymous/system. |
| `audit_logs` | **ghi nhận trên** | `các đối tượng hệ thống` | 0..N | 0..1 | Quan hệ polymorphic qua entity_type/entity_id. |

## 5. Các liên kết quan trọng theo luồng nghiệp vụ

### 5.1 Tài khoản và điều kiện tham gia

```text
departments 1 ── 0..N academic_programs
internship_terms 1 ── 0..N student_rosters
academic_programs 1 ── 0..N student_rosters
users 1 ── 0..N student_rosters (claimed_user_id; roster có thể 0..1 user)
users 1 ── 0..1 student_profiles
```

### 5.2 Hồ sơ kỹ năng và AI

```text
users 1 ── 0..N student_skills
skill_taxonomies 1 ── 0..N student_skills
job_positions 1 ── 0..N job_skills
skill_taxonomies 1 ── 0..N job_skills
users/documents/job_positions 1 ── 0..N ai_runs
```

Luồng dữ liệu:

```text
CV document
-> ai_runs(CV_EXTRACTION)
-> student_skills đã xác nhận
-> job_skills
-> ai_runs(MATCHING)
-> job_applications.ai_match_detail snapshot
```

### 5.3 Tuyển dụng và khởi tạo thực tập

```text
companies 1 ── 0..N job_positions
job_positions 1 ── 0..N job_applications
users(STUDENT) 1 ── 0..N job_applications
job_applications 1 ── 0..1 placement_offers
placement_offers 1 ── 0..1 learning_agreements
learning_agreements 1 ── 0..1 internship_placements
```

### 5.4 Thực hiện, ngoại lệ và đánh giá

```text
internship_placements 1 ── 0..N placement_tasks
internship_placements 1 ── 0..N attendance_logs
internship_placements 1 ── 0..N weekly_logbooks
internship_placements 1 ── 0..N internship_cases
internship_placements 1 ── 0..N rubric_evaluations
internship_placements 1 ── 0..1 final_results
```

### 5.5 Thông báo và lịch sử

```text
users 1 ── 0..N notifications
users 0..1 ── 0..N state_history
users 0..1 ── 0..N audit_logs

aggregate 1 ── 0..N state_history
aggregate 0..1 ── 0..N notifications
system entity 0..1 ── 0..N audit_logs
```

## 6. Các quan hệ cần đánh dấu nét đứt trên CDM

Các liên kết sau là logical/polymorphic, không có FK PostgreSQL trực tiếp trong mô hình lean:

| Quan hệ | Cách triển khai | Lý do |
|---|---|---|
| Job Position – Academic Program | `target_program_codes JSONB` | Giữ 26 bảng; backend xác minh mã ngành. Nếu cần FK tuyệt đối, thêm `job_programs` thành bảng 27. |
| Document – Aggregate | `context_type + context_id` | Một bảng document dùng cho nhiều loại nghiệp vụ. |
| State History – Aggregate | `entity_type + entity_id` | Một history dùng chung cho nhiều state machine. |
| Audit Log – Entity | `entity_type + entity_id` | Audit có thể áp dụng cả tài khoản, tài liệu và cấu hình. |
| Notification – Aggregate | `related_entity_type + related_entity_id` | Notification chỉ dẫn tới đối tượng nguồn, không sở hữu nghiệp vụ. |

## 7. Ràng buộc nghiệp vụ cần ghi chú trên sơ đồ

1. `users.department_id` dùng cho STUDENT, LECTURER, FACULTY_ADMIN; `users.company_id` dùng cho COMPANY_REP, COMPANY_MENTOR.
2. User role ADMIN có thể không thuộc Khoa hoặc doanh nghiệp.
3. Một student profile chỉ thuộc user có role STUDENT.
4. Mentor/GVHD của placement phải đúng role và đúng tổ chức.
5. Chỉ Offer ACCEPTED mới tạo Agreement; chỉ Agreement APPROVED mới kích hoạt Placement.
6. Một sinh viên không được có hai placement ACTIVE trong cùng kỳ, trừ khi quy định chuyển placement cho phép giai đoạn chuyển tiếp.
7. AI chỉ xếp hạng các job backend đã lọc theo trạng thái, Khoa/ngành và điều kiện sinh viên.
8. Output AI không tự trở thành kỹ năng chính thức; kỹ năng phải được xác nhận trong `student_skills`.
9. `final_results` do FACULTY_ADMIN quyết định dựa trên rubric và dữ liệu tuân thủ.
10. Mọi chuyển trạng thái quan trọng phải ghi `state_history` trong cùng transaction.
11. Notification được tạo sau khi nghiệp vụ thành công và không thay thế record nghiệp vụ.
12. Audit không được chứa password, token, toàn bộ CV hoặc dữ liệu bí mật.
