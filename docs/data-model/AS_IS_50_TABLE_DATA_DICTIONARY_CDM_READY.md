# AS-IS 50 Table Data Dictionary - CDM Ready

> **Mục tiêu tài liệu:** chuyển dữ liệu hiện trạng 50 bảng thành ngôn ngữ mô hình dữ liệu khái niệm (CDM), đồng thời vẫn giữ vết sang lược đồ vật lý để đối chiếu. Tài liệu này không thay đổi hành vi hệ thống, không xóa bảng và không phải migration.
>
> **Phạm vi nghiệp vụ:** **CTU InternLink - Hệ thống quản lý toàn trình thực tập doanh nghiệp tích hợp trích xuất kỹ năng và xếp hạng mức phù hợp giữa sinh viên và vị trí thực tập tại Trường Đại học Cần Thơ.**
>
> **Nguồn sự thật:** Flyway V1-V4 của nhánh `archive/current-full-system` và `AS_IS_50_TABLE_DATA_DICTIONARY.md`. Ký hiệu: PK = khóa chính, FK = khóa ngoại, Candidate key = khóa ứng viên, Derived/stored = giá trị dẫn xuất đang được lưu, Technical/Audit = chi tiết triển khai.

## 1. System Domain Overview

### 1.1 Ranh giới hệ thống

Hệ thống bao phủ sáu nhóm người dùng: Sinh viên, Đại diện doanh nghiệp, Mentor doanh nghiệp, Giảng viên hướng dẫn, Quản lý khoa và Quản trị viên. Quy trình cốt lõi đi từ quản lý danh tính và kỳ thực tập, công bố vị trí, đối sánh/ứng tuyển, phỏng vấn và tiếp nhận, thiết lập thỏa thuận, theo dõi thực tập, xử lý ngoại lệ, đánh giá và công nhận kết quả.

AI là năng lực hỗ trợ ra quyết định. AI trích xuất kỹ năng từ CV, chuẩn hóa về từ điển kỹ năng và tính mức phù hợp; AI không tự phê duyệt hồ sơ, tuyển sinh viên hoặc quyết định kết quả thực tập.

### 1.2 Miền nghiệp vụ

| Miền | Trách nhiệm | Thực thể chính |
|---|---|---|
| Địa lý & tổ chức | Cấu trúc CTU và địa chỉ chuẩn hóa. | Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Địa chỉ, Trường đại học, Khoa/Đơn vị đào tạo |
| Danh tính & truy cập | Tài khoản, actor và quyền tham gia. | Tài khoản người dùng, Sinh viên trong danh sách chính thức |
| Doanh nghiệp & đối tác | Hồ sơ, thẩm định và hợp tác doanh nghiệp. | Doanh nghiệp, Lần thẩm định doanh nghiệp, Quan hệ hợp tác Khoa–Doanh nghiệp |
| Hồ sơ năng lực & AI | Hồ sơ năng lực, CV, kỹ năng và kết quả đối sánh. | Kỹ năng chuẩn hóa, Yêu cầu kỹ năng của vị trí, Hồ sơ sinh viên, Kỹ năng của sinh viên, Học phần của sinh viên, Chứng chỉ của sinh viên, Phiên bản CV, Kết quả phân tích CV, Kết quả xếp hạng phù hợp |
| Tuyển dụng | Vị trí, ứng tuyển và phỏng vấn. | Vị trí thực tập, Hồ sơ ứng tuyển, Lịch phỏng vấn, Người tham gia phỏng vấn |
| Quản lý học kỳ & phân công | Kỳ thực tập, đăng ký và giảng viên phụ trách. | Kỳ thực tập, Đăng ký kỳ thực tập, Phân công giảng viên hướng dẫn, Lịch sử phân công hướng dẫn |
| Thỏa thuận & thực hiện | Cam kết ba bên và điều kiện thực hiện. | Thỏa thuận học tập, Phụ lục thay đổi thỏa thuận, Lịch làm việc thực tập, Đề xuất đổi lịch |
| Ngoại lệ & bảo vệ | Chuyển nơi, kết thúc sớm, sự cố và khiếu nại. | Yêu cầu chuyển nơi/vị trí thực tập, Yêu cầu kết thúc sớm, Tranh chấp chấm công, Ngoại lệ thực tập, Sự cố thực tập, Khiếu nại kết quả thực tập |
| Theo dõi thực tập | Nhật ký, chấm công và tuân thủ tiến độ. | Nhật ký thực tập, Mục nhật ký, Phiên chấm công, Yêu cầu sửa chấm công, Nhật ký kiểm toán chấm công, Đối soát tuân thủ tuần |
| Đánh giá & công nhận | Rubric, năng lực, khảo sát và kết quả. | Năng lực NACE, Phiếu đánh giá, Điểm tiêu chí đánh giá, Khảo sát hài lòng |
| Hỗ trợ hệ thống | Thông báo phục vụ tác nghiệp. | Thông báo |
| Kỹ thuật | Quản trị phiên bản lược đồ; ngoài CDM. | Lịch sử migration Flyway |

### 1.3 Phân biệt mô hình

- **CDM:** dùng tên thực thể nghiệp vụ, mục đích và quan hệ; không phụ thuộc PostgreSQL, URL tệp, JSONB, vector, timestamp kỹ thuật hoặc Flyway.
- **LDM:** bổ sung thuộc tính logic, khóa ứng viên, từ điển trạng thái, thực thể liên kết và chuẩn hóa dữ liệu.
- **PDM:** ánh xạ sang đúng tên bảng/cột, kiểu PostgreSQL, PK/FK, index, JSONB, pgvector và audit.
- Một bảng vật lý không mặc nhiên là một thực thể CDM. `flyway_schema_history` chỉ là bảng kỹ thuật; `attendance_audit_logs` và `assignment_histories` là dấu vết kiểm toán; các bảng liên kết có thể được thể hiện bằng quan hệ trên CDM.

## 2. Business Entity Catalog

| # | Conceptual Entity | Physical Table | Domain | Category | CDM Inclusion | Business Purpose |
|---:|---|---|---|---|---|---|
| 1 | Tỉnh/Thành phố | `provinces` | Địa lý & tổ chức | MASTER DATA | Có | Cung cấp cấp địa giới cao nhất cho địa chỉ trường, doanh nghiệp và vị trí. |
| 2 | Quận/Huyện | `districts` | Địa lý & tổ chức | MASTER DATA | Có | Chuẩn hóa cấp địa giới trung gian của địa chỉ. |
| 3 | Phường/Xã | `wards` | Địa lý & tổ chức | MASTER DATA | Có | Chuẩn hóa cấp địa giới chi tiết của địa chỉ. |
| 4 | Địa chỉ | `addresses` | Địa lý & tổ chức | REFERENCE ENTITY | Có | Được trường, doanh nghiệp và vị trí thực tập tham chiếu để tránh lặp dữ liệu địa lý. |
| 5 | Trường đại học | `universities` | Địa lý & tổ chức | MASTER DATA | Có | Xác định phạm vi tổ chức; trong đề tài hiện tại là Trường Đại học Cần Thơ. |
| 6 | Khoa/Đơn vị đào tạo | `departments` | Địa lý & tổ chức | MASTER DATA | Có | Phân vùng quản lý sinh viên, cán bộ, đối tác và tin tuyển dụng. |
| 7 | Tài khoản người dùng | `users` | Danh tính & truy cập | BUSINESS ENTITY | Có | Xác thực sáu actor và gắn người dùng với đơn vị quản lý khi phù hợp. |
| 8 | Doanh nghiệp | `companies` | Doanh nghiệp & đối tác | BUSINESS ENTITY | Có | Là chủ thể đăng vị trí, cung cấp mentor và tiếp nhận sinh viên. |
| 9 | Lần thẩm định doanh nghiệp | `company_verifications` | Doanh nghiệp & đối tác | TRANSACTION ENTITY | Có | Lưu quyết định, checklist và người thẩm định để truy vết. |
| 10 | Quan hệ hợp tác Khoa–Doanh nghiệp | `department_company_partnerships` | Doanh nghiệp & đối tác | BUSINESS ENTITY | Có | Kiểm soát thời hạn và trạng thái hợp tác phục vụ thực tập. |
| 11 | Kỹ năng chuẩn hóa | `skills` | Hồ sơ năng lực & AI | MASTER DATA | Có | Là ngôn ngữ chung để mô tả năng lực sinh viên và yêu cầu vị trí. |
| 12 | Vị trí thực tập | `jobs` | Tuyển dụng | BUSINESS ENTITY | Có | Mô tả cơ hội, chỉ tiêu, đối tượng, kết quả học tập mong đợi và vòng đời tuyển dụng. |
| 13 | Yêu cầu kỹ năng của vị trí | `job_skills` | Hồ sơ năng lực & AI | REFERENCE ENTITY | Có | Cung cấp đầu vào chuẩn hóa cho xếp hạng mức phù hợp. |
| 14 | Sinh viên trong danh sách chính thức | `student_rosters` | Danh tính & truy cập | REFERENCE ENTITY | Có | Kiểm soát đối tượng được kích hoạt tài khoản và tham gia kỳ thực tập. |
| 15 | Hồ sơ sinh viên | `student_profiles` | Hồ sơ năng lực & AI | BUSINESS ENTITY | Có | Làm nguồn dữ liệu hồ sơ cho ứng tuyển và đối sánh. |
| 16 | Kỹ năng của sinh viên | `student_skills` | Hồ sơ năng lực & AI | REFERENCE ENTITY | Có | Biểu diễn năng lực chuẩn hóa để đối sánh vị trí. |
| 17 | Học phần của sinh viên | `student_courses` | Hồ sơ năng lực & AI | REFERENCE ENTITY | Có | Bổ sung tín hiệu học thuật cho hồ sơ và AI. |
| 18 | Chứng chỉ của sinh viên | `student_certificates` | Hồ sơ năng lực & AI | REFERENCE ENTITY | Có | Bổ sung bằng chứng năng lực ngoài chương trình học. |
| 19 | Phiên bản CV | `curriculum_vitaes` | Hồ sơ năng lực & AI | BUSINESS ENTITY | Có | Giữ tài liệu đầu vào có phiên bản cho trích xuất kỹ năng và ứng tuyển. |
| 20 | Kết quả phân tích CV | `cv_analysis` | Hồ sơ năng lực & AI | TRANSACTION ENTITY | Có | Lưu đầu ra phân tích để giải thích và tái sử dụng trong hồ sơ năng lực. |
| 21 | Kỳ thực tập | `internship_terms` | Quản lý học kỳ & phân công | BUSINESS ENTITY | Có | Đặt khung thời gian, quy định và trạng thái cho toàn bộ quy trình. |
| 22 | Đăng ký kỳ thực tập | `term_student_registrations` | Quản lý học kỳ & phân công | TRANSACTION ENTITY | Có | Xác định phạm vi sinh viên hợp lệ của từng kỳ. |
| 23 | Phân công giảng viên hướng dẫn | `supervisor_assignments` | Quản lý học kỳ & phân công | TRANSACTION ENTITY | Có | Thiết lập trách nhiệm giám sát học thuật. |
| 24 | Lịch sử phân công hướng dẫn | `assignment_histories` | Quản lý học kỳ & phân công | AUDIT/TECHNICAL | Tùy mức chi tiết | Giải thích ai được đổi, lý do và thời điểm thay đổi. |
| 25 | Hồ sơ ứng tuyển | `applications` | Tuyển dụng | TRANSACTION ENTITY | Có | Quản lý quá trình nộp, sàng lọc, phỏng vấn và quyết định tuyển. |
| 26 | Kết quả xếp hạng phù hợp | `matching_results` | Hồ sơ năng lực & AI | TRANSACTION ENTITY | Có | Cung cấp điểm, giải thích và xếp hạng hỗ trợ quyết định, không thay quyết định con người. |
| 27 | Lịch phỏng vấn | `interviews` | Tuyển dụng | TRANSACTION ENTITY | Có | Quản lý lịch, hình thức, kết quả và phản hồi phỏng vấn. |
| 28 | Người tham gia phỏng vấn | `interview_participants` | Tuyển dụng | REFERENCE ENTITY | Có | Biểu diễn hội đồng/người tham gia của từng buổi. |
| 29 | Thỏa thuận học tập | `learning_agreements` | Thỏa thuận & thực hiện | BUSINESS ENTITY | Có | Là căn cứ học thuật và vận hành cho quá trình thực tập đã được chấp thuận. |
| 30 | Phụ lục thay đổi thỏa thuận | `agreement_amendments` | Thỏa thuận & thực hiện | TRANSACTION ENTITY | Có | Kiểm soát thay đổi mục tiêu, nhiệm vụ hoặc điều kiện trong quá trình thực tập. |
| 31 | Lịch làm việc thực tập | `internship_work_schedules` | Thỏa thuận & thực hiện | BUSINESS ENTITY | Có | Làm chuẩn để chấm công và kiểm tra tuân thủ. |
| 32 | Đề xuất đổi lịch | `internship_schedule_proposals` | Thỏa thuận & thực hiện | TRANSACTION ENTITY | Có | Bảo đảm mọi thay đổi lịch được phê duyệt và truy vết. |
| 33 | Yêu cầu chuyển nơi/vị trí thực tập | `internship_transfer_requests` | Ngoại lệ & bảo vệ | TRANSACTION ENTITY | Có | Điều phối ngoại lệ chuyển tiếp mà không làm mất lịch sử. |
| 34 | Yêu cầu kết thúc sớm | `early_termination_requests` | Ngoại lệ & bảo vệ | TRANSACTION ENTITY | Có | Ghi nhận lý do, bên khởi tạo và quyết định xử lý nghỉ ngang/chấm dứt. |
| 35 | Nhật ký thực tập | `logbooks` | Theo dõi thực tập | BUSINESS ENTITY | Có | Tập hợp báo cáo tiến độ và trạng thái duyệt nhật ký. |
| 36 | Mục nhật ký | `logbook_entries` | Theo dõi thực tập | TRANSACTION ENTITY | Có | Cung cấp bằng chứng học tập tại nơi làm việc và dữ liệu theo dõi tiến độ. |
| 37 | Phiên chấm công | `attendance_sessions` | Theo dõi thực tập | TRANSACTION ENTITY | Có | Ghi nhận hiện diện, vị trí, thời lượng và kết quả xác minh. |
| 38 | Yêu cầu sửa chấm công | `attendance_correction_requests` | Theo dõi thực tập | TRANSACTION ENTITY | Có | Cho phép sửa sai có phê duyệt và không mất dấu dữ liệu gốc. |
| 39 | Tranh chấp chấm công | `attendance_disputes` | Ngoại lệ & bảo vệ | TRANSACTION ENTITY | Có | Hỗ trợ xử lý bất đồng và ghi nhận quyết định. |
| 40 | Nhật ký kiểm toán chấm công | `attendance_audit_logs` | Theo dõi thực tập | AUDIT/TECHNICAL | Tùy mức chi tiết | Bảo đảm khả năng kiểm tra ai đã thay đổi giá trị nào và khi nào. |
| 41 | Ngoại lệ thực tập | `internship_exceptions` | Ngoại lệ & bảo vệ | TRANSACTION ENTITY | Có | Theo dõi loại sự cố, mức độ, xử lý và trạng thái khắc phục. |
| 42 | Sự cố thực tập | `internship_incidents` | Ngoại lệ & bảo vệ | TRANSACTION ENTITY | Có | Ghi nhận, phân loại và theo dõi xử lý sự cố. |
| 43 | Đối soát tuân thủ tuần | `weekly_compliance_records` | Theo dõi thực tập | TRANSACTION ENTITY | Có | Cảnh báo thiếu giờ, thiếu nhật ký hoặc sai lệch tiến độ. |
| 44 | Năng lực NACE | `nace_competencies` | Đánh giá & công nhận | MASTER DATA | Có | Chuẩn hóa tiêu chí đánh giá năng lực đầu ra. |
| 45 | Phiếu đánh giá | `rubric_evaluations` | Đánh giá & công nhận | TRANSACTION ENTITY | Có | Ghi nhận đánh giá giữa kỳ/cuối kỳ và tổng điểm. |
| 46 | Điểm tiêu chí đánh giá | `rubric_criteria_scores` | Đánh giá & công nhận | TRANSACTION ENTITY | Có | Giải thích tổng điểm và thể hiện năng lực chi tiết. |
| 47 | Khiếu nại kết quả thực tập | `internship_appeals` | Ngoại lệ & bảo vệ | TRANSACTION ENTITY | Có | Cung cấp quy trình phản hồi, giải quyết và truy vết công bằng. |
| 48 | Thông báo | `notifications` | Hỗ trợ hệ thống | TRANSACTION ENTITY | Có | Thông báo sự kiện và yêu cầu hành động; không phải nguồn sự thật nghiệp vụ. |
| 49 | Khảo sát hài lòng | `satisfaction_surveys` | Đánh giá & công nhận | TRANSACTION ENTITY | Có | Đo trải nghiệm và hỗ trợ cải tiến chương trình. |
| 50 | Lịch sử migration Flyway | `flyway_schema_history` | Kỹ thuật | AUDIT/TECHNICAL | Không | Chỉ phục vụ triển khai cơ sở dữ liệu; loại khỏi CDM nghiệp vụ. |

## 3. Entity Detail

### 3.1 Tỉnh/Thành phố (`provinces`)

- **Category:** MASTER DATA
- **Domain:** Địa lý & tổ chức
- **Description:** Danh mục tỉnh, thành phố dùng để chuẩn hóa địa chỉ.
- **Business purpose:** Cung cấp cấp địa giới cao nhất cho địa chỉ trường, doanh nghiệp và vị trí.
- **Primary identifier:** `id`.
- **Candidate key:** `code`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `province_name` | `VARCHAR(200)` | Có | Dữ liệu province name của tỉnh/thành phố. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `code` **[Candidate key]** | `VARCHAR(50)` | Có | Mã nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Tỉnh/Thành phố có Quận/Huyện**: phía quận/huyện là 0..N; FK `districts.province_id`.
- **Tỉnh/Thành phố có Hồ sơ sinh viên**: phía hồ sơ sinh viên là 0..N; FK `student_profiles.preferred_province_id`.

### 3.2 Quận/Huyện (`districts`)

- **Category:** MASTER DATA
- **Domain:** Địa lý & tổ chức
- **Description:** Danh mục quận, huyện trực thuộc tỉnh/thành phố.
- **Business purpose:** Chuẩn hóa cấp địa giới trung gian của địa chỉ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `province_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tỉnh/Thành phố (`provinces.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `district_name` | `VARCHAR(200)` | Có | Dữ liệu district name của quận/huyện. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `code` | `VARCHAR(50)` | Không | Mã nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Quận/Huyện thuộc Tỉnh/Thành phố** qua `province_id`: bắt buộc đúng 1 Tỉnh/Thành phố.
- **Quận/Huyện có Phường/Xã**: phía phường/xã là 0..N; FK `wards.district_id`.

### 3.3 Phường/Xã (`wards`)

- **Category:** MASTER DATA
- **Domain:** Địa lý & tổ chức
- **Description:** Danh mục phường, xã trực thuộc quận/huyện.
- **Business purpose:** Chuẩn hóa cấp địa giới chi tiết của địa chỉ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `district_id` **[FK]** | `BIGINT` | Có | Tham chiếu Quận/Huyện (`districts.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `ward_name` | `VARCHAR(200)` | Có | Dữ liệu ward name của phường/xã. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `code` | `VARCHAR(50)` | Không | Mã nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Phường/Xã thuộc Quận/Huyện** qua `district_id`: bắt buộc đúng 1 Quận/Huyện.
- **Phường/Xã có Địa chỉ**: phía địa chỉ là 0..N; FK `addresses.ward_id`.

### 3.4 Địa chỉ (`addresses`)

- **Category:** REFERENCE ENTITY
- **Domain:** Địa lý & tổ chức
- **Description:** Địa chỉ có cấu trúc, tọa độ và loại địa điểm.
- **Business purpose:** Được trường, doanh nghiệp và vị trí thực tập tham chiếu để tránh lặp dữ liệu địa lý.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `ward_id` **[FK]** | `BIGINT` | Không | Tham chiếu Phường/Xã (`wards.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `address_line` | `VARCHAR(255)` | Có | Dòng địa chỉ chi tiết. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `region_type` | `VARCHAR(30)` | Không | Dữ liệu region type của địa chỉ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `postal_code` | `VARCHAR(20)` | Không | Mã bưu chính. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `latitude` | `NUMERIC(10, 7)` | Không | Vĩ độ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `longitude` | `NUMERIC(10, 7)` | Không | Kinh độ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Địa chỉ định vị tại Phường/Xã** qua `ward_id`: 0..1 Phường/Xã.
- **Địa chỉ có Trường đại học**: phía trường đại học là 0..N; FK `universities.address_id`.
- **Địa chỉ có Doanh nghiệp**: phía doanh nghiệp là 0..N; FK `companies.address_id`.
- **Địa chỉ có Vị trí thực tập**: phía vị trí thực tập là 0..N; FK `jobs.address_id`.

### 3.5 Trường đại học (`universities`)

- **Category:** MASTER DATA
- **Domain:** Địa lý & tổ chức
- **Description:** Đơn vị trường đại học vận hành chương trình thực tập.
- **Business purpose:** Xác định phạm vi tổ chức; trong đề tài hiện tại là Trường Đại học Cần Thơ.
- **Primary identifier:** `id`.
- **Candidate key:** `code`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `university_name` | `VARCHAR(500)` | Có | Dữ liệu university name của trường đại học. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `code` **[Candidate key]** | `VARCHAR(50)` | Có | Mã nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `website` | `VARCHAR(255)` | Không | Trang thông tin điện tử. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `address_id` **[FK]** | `BIGINT` | Không | Tham chiếu Địa chỉ (`addresses.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Trường đại học sử dụng địa chỉ Địa chỉ** qua `address_id`: 0..1 Địa chỉ.
- **Trường đại học có Khoa/Đơn vị đào tạo**: phía khoa/đơn vị đào tạo là 0..N; FK `departments.university_id`.

### 3.6 Khoa/Đơn vị đào tạo (`departments`)

- **Category:** MASTER DATA
- **Domain:** Địa lý & tổ chức
- **Description:** Khoa, trường hoặc đơn vị chuyên môn trực thuộc đại học.
- **Business purpose:** Phân vùng quản lý sinh viên, cán bộ, đối tác và tin tuyển dụng.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `university_id` **[FK]** | `BIGINT` | Có | Tham chiếu Trường đại học (`universities.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `department_name` | `VARCHAR(150)` | Có | Dữ liệu department name của khoa/đơn vị đào tạo. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `department_type` | `VARCHAR(50)` | Có | Dữ liệu department type của khoa/đơn vị đào tạo. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `description` | `TEXT` | Không | Mô tả. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Khoa/Đơn vị đào tạo trực thuộc Trường đại học** qua `university_id`: bắt buộc đúng 1 Trường đại học.
- **Khoa/Đơn vị đào tạo có Tài khoản người dùng**: phía tài khoản người dùng là 0..N; FK `users.department_id`.
- **Khoa/Đơn vị đào tạo có Quan hệ hợp tác Khoa–Doanh nghiệp**: phía quan hệ hợp tác khoa–doanh nghiệp là 0..N; FK `department_company_partnerships.department_id`.
- **Khoa/Đơn vị đào tạo có Vị trí thực tập**: phía vị trí thực tập là 0..N; FK `jobs.department_id`.
- **Khoa/Đơn vị đào tạo có Sinh viên trong danh sách chính thức**: phía sinh viên trong danh sách chính thức là 0..N; FK `student_rosters.department_id`.
- **Khoa/Đơn vị đào tạo có Kỳ thực tập**: phía kỳ thực tập là 0..N; FK `internship_terms.department_id`.

### 3.7 Tài khoản người dùng (`users`)

- **Category:** BUSINESS ENTITY
- **Domain:** Danh tính & truy cập
- **Description:** Danh tính đăng nhập và vai trò của người tham gia hệ thống.
- **Business purpose:** Xác thực sáu actor và gắn người dùng với đơn vị quản lý khi phù hợp.
- **Primary identifier:** `id`.
- **Candidate key:** `email`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `email` **[Candidate key]** | `VARCHAR(150)` | Có | Địa chỉ thư điện tử. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `password_hash` | `VARCHAR(255)` | Có | Mật khẩu đã băm. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `full_name` | `VARCHAR(150)` | Có | Họ và tên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `phone_number` | `VARCHAR(20)` | Không | Số điện thoại. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `role` | `VARCHAR(30)` | Có | Vai trò truy cập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `department_id` **[FK]** | `BIGINT` | Không | Tham chiếu Khoa/Đơn vị đào tạo (`departments.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `avatar_url` | `TEXT` | Không | Đường dẫn tài nguyên avatar. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `is_active` | `BOOLEAN` | Không | Cờ cho phép hoạt động. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Tài khoản người dùng thuộc/phụ trách bởi Khoa/Đơn vị đào tạo** qua `department_id`: 0..1 Khoa/Đơn vị đào tạo.
- **Tài khoản người dùng có Doanh nghiệp**: phía doanh nghiệp là 0..N; FK `companies.created_by_user_id`.
- **Tài khoản người dùng có Lần thẩm định doanh nghiệp**: phía lần thẩm định doanh nghiệp là 0..N; FK `company_verifications.reviewed_by_faculty_id`.
- **Tài khoản người dùng có Quan hệ hợp tác Khoa–Doanh nghiệp**: phía quan hệ hợp tác khoa–doanh nghiệp là 0..N; FK `department_company_partnerships.approved_by_user_id`.
- **Tài khoản người dùng có Vị trí thực tập**: phía vị trí thực tập là 0..N; FK `jobs.approved_by_user_id`.
- **Tài khoản người dùng có Sinh viên trong danh sách chính thức**: phía sinh viên trong danh sách chính thức là 0..N; FK `student_rosters.claimed_user_id`.
- **Tài khoản người dùng có Hồ sơ sinh viên**: phía hồ sơ sinh viên là 0..1; FK `student_profiles.user_id`.
- **Tài khoản người dùng có Phân công giảng viên hướng dẫn**: phía phân công giảng viên hướng dẫn là 0..N; FK `supervisor_assignments.lecturer_user_id`.
- **Tài khoản người dùng có Phân công giảng viên hướng dẫn**: phía phân công giảng viên hướng dẫn là 0..N; FK `supervisor_assignments.assigned_by_user_id`.
- **Tài khoản người dùng có Lịch sử phân công hướng dẫn**: phía lịch sử phân công hướng dẫn là 0..N; FK `assignment_histories.previous_lecturer_id`.
- **Tài khoản người dùng có Lịch sử phân công hướng dẫn**: phía lịch sử phân công hướng dẫn là 0..N; FK `assignment_histories.new_lecturer_id`.
- **Tài khoản người dùng có Lịch sử phân công hướng dẫn**: phía lịch sử phân công hướng dẫn là 0..N; FK `assignment_histories.changed_by_user_id`.
- **Tài khoản người dùng có Lịch phỏng vấn**: phía lịch phỏng vấn là 0..N; FK `interviews.created_by_user_id`.
- **Tài khoản người dùng có Người tham gia phỏng vấn**: phía người tham gia phỏng vấn là 0..N; FK `interview_participants.user_id`.
- **Tài khoản người dùng có Thỏa thuận học tập**: phía thỏa thuận học tập là 0..N; FK `learning_agreements.student_id`.
- **Tài khoản người dùng có Thỏa thuận học tập**: phía thỏa thuận học tập là 0..N; FK `learning_agreements.academic_supervisor_id`.
- **Tài khoản người dùng có Thỏa thuận học tập**: phía thỏa thuận học tập là 0..N; FK `learning_agreements.company_mentor_id`.
- **Tài khoản người dùng có Đề xuất đổi lịch**: phía đề xuất đổi lịch là 0..N; FK `internship_schedule_proposals.proposed_by_user_id`.
- **Tài khoản người dùng có Đề xuất đổi lịch**: phía đề xuất đổi lịch là 0..N; FK `internship_schedule_proposals.reviewed_by_user_id`.
- **Tài khoản người dùng có Yêu cầu chuyển nơi/vị trí thực tập**: phía yêu cầu chuyển nơi/vị trí thực tập là 0..N; FK `internship_transfer_requests.student_id`.
- **Tài khoản người dùng có Yêu cầu chuyển nơi/vị trí thực tập**: phía yêu cầu chuyển nơi/vị trí thực tập là 0..N; FK `internship_transfer_requests.approved_by_user_id`.
- **Tài khoản người dùng có Yêu cầu kết thúc sớm**: phía yêu cầu kết thúc sớm là 0..N; FK `early_termination_requests.initiated_by_user_id`.
- **Tài khoản người dùng có Yêu cầu sửa chấm công**: phía yêu cầu sửa chấm công là 0..N; FK `attendance_correction_requests.student_id`.
- **Tài khoản người dùng có Yêu cầu sửa chấm công**: phía yêu cầu sửa chấm công là 0..N; FK `attendance_correction_requests.reviewed_by_user_id`.
- **Tài khoản người dùng có Tranh chấp chấm công**: phía tranh chấp chấm công là 0..N; FK `attendance_disputes.student_id`.
- **Tài khoản người dùng có Nhật ký kiểm toán chấm công**: phía nhật ký kiểm toán chấm công là 0..N; FK `attendance_audit_logs.changed_by_user_id`.
- **Tài khoản người dùng có Ngoại lệ thực tập**: phía ngoại lệ thực tập là 0..N; FK `internship_exceptions.proposed_by_user_id`.
- **Tài khoản người dùng có Ngoại lệ thực tập**: phía ngoại lệ thực tập là 0..N; FK `internship_exceptions.approved_by_user_id`.
- **Tài khoản người dùng có Sự cố thực tập**: phía sự cố thực tập là 0..N; FK `internship_incidents.reported_by_user_id`.
- **Tài khoản người dùng có Sự cố thực tập**: phía sự cố thực tập là 0..N; FK `internship_incidents.resolved_by_user_id`.
- **Tài khoản người dùng có Phiếu đánh giá**: phía phiếu đánh giá là 0..N; FK `rubric_evaluations.evaluator_user_id`.
- **Tài khoản người dùng có Khiếu nại kết quả thực tập**: phía khiếu nại kết quả thực tập là 0..N; FK `internship_appeals.student_user_id`.
- **Tài khoản người dùng có Khiếu nại kết quả thực tập**: phía khiếu nại kết quả thực tập là 0..N; FK `internship_appeals.handled_by_user_id`.
- **Tài khoản người dùng có Thông báo**: phía thông báo là 0..N; FK `notifications.user_id`.
- **Tài khoản người dùng có Khảo sát hài lòng**: phía khảo sát hài lòng là 0..N; FK `satisfaction_surveys.submitted_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.changed_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.sent_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.created_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.updated_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.student_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.company_mentor_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.academic_supervisor_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.state_changed_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.created_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.updated_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.owner_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.created_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.updated_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.created_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.finalized_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.published_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.created_by_user_id`.
- **Tài khoản người dùng có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.updated_by_user_id`.

### 3.8 Doanh nghiệp (`companies`)

- **Category:** BUSINESS ENTITY
- **Domain:** Doanh nghiệp & đối tác
- **Description:** Hồ sơ tổ chức tiếp nhận sinh viên thực tập.
- **Business purpose:** Là chủ thể đăng vị trí, cung cấp mentor và tiếp nhận sinh viên.
- **Primary identifier:** `id`.
- **Candidate key:** `tax_code`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `name` | `VARCHAR(255)` | Có | Tên hiển thị. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `tax_code` **[Candidate key]** | `VARCHAR(50)` | Không | Dữ liệu tax code của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `industry` | `VARCHAR(100)` | Không | Dữ liệu industry của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `website` | `VARCHAR(255)` | Không | Trang thông tin điện tử. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `address_id` **[FK]** | `BIGINT` | Không | Tham chiếu Địa chỉ (`addresses.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `address_raw` | `TEXT` | Không | Dữ liệu address raw của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `contact_name` | `VARCHAR(150)` | Không | Dữ liệu contact name của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `contact_email` | `VARCHAR(150)` | Không | Dữ liệu contact email của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `contact_phone` | `VARCHAR(20)` | Không | Dữ liệu contact phone của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `description` | `TEXT` | Không | Mô tả. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `work_environment_info` | `TEXT` | Không | Dữ liệu work environment info của doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mou_status` | `VARCHAR(30)` | Không | Trạng thái mou. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `verification_status` | `VARCHAR(30)` | Không | Trạng thái verification. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Doanh nghiệp sử dụng địa chỉ Địa chỉ** qua `address_id`: 0..1 Địa chỉ.
- **Doanh nghiệp được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: 0..1 Tài khoản người dùng.
- **Doanh nghiệp có Lần thẩm định doanh nghiệp**: phía lần thẩm định doanh nghiệp là 0..N; FK `company_verifications.company_id`.
- **Doanh nghiệp có Quan hệ hợp tác Khoa–Doanh nghiệp**: phía quan hệ hợp tác khoa–doanh nghiệp là 0..N; FK `department_company_partnerships.company_id`.
- **Doanh nghiệp có Vị trí thực tập**: phía vị trí thực tập là 0..N; FK `jobs.company_id`.
- **Doanh nghiệp có Yêu cầu chuyển nơi/vị trí thực tập**: phía yêu cầu chuyển nơi/vị trí thực tập là 0..N; FK `internship_transfer_requests.old_company_id`.
- **Doanh nghiệp có Yêu cầu chuyển nơi/vị trí thực tập**: phía yêu cầu chuyển nơi/vị trí thực tập là 0..N; FK `internship_transfer_requests.new_company_id`.
- **Doanh nghiệp có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.company_id`.

### 3.9 Lần thẩm định doanh nghiệp (`company_verifications`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Doanh nghiệp & đối tác
- **Description:** Kết quả một lần khoa xem xét điều kiện của doanh nghiệp.
- **Business purpose:** Lưu quyết định, checklist và người thẩm định để truy vết.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `company_id` **[FK]** | `BIGINT` | Có | Tham chiếu Doanh nghiệp (`companies.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reviewed_by_faculty_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `review_notes` | `TEXT` | Không | Ghi chú thẩm định. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `checklist_passed` | `JSONB` | Không | Dữ liệu checklist passed của lần thẩm định doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `reviewed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm xem xét. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Lần thẩm định doanh nghiệp thuộc doanh nghiệp Doanh nghiệp** qua `company_id`: bắt buộc đúng 1 Doanh nghiệp.
- **Lần thẩm định doanh nghiệp được thẩm định bởi Tài khoản người dùng** qua `reviewed_by_faculty_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.10 Quan hệ hợp tác Khoa–Doanh nghiệp (`department_company_partnerships`)

- **Category:** BUSINESS ENTITY
- **Domain:** Doanh nghiệp & đối tác
- **Description:** Quan hệ hợp tác/MOU giữa một khoa và một doanh nghiệp.
- **Business purpose:** Kiểm soát thời hạn và trạng thái hợp tác phục vụ thực tập.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `department_id` **[FK]** | `BIGINT` | Có | Tham chiếu Khoa/Đơn vị đào tạo (`departments.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `company_id` **[FK]** | `BIGINT` | Có | Tham chiếu Doanh nghiệp (`companies.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `partnership_status` | `VARCHAR(30)` | Có | Trạng thái partnership. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `mou_code` | `VARCHAR(100)` | Không | Dữ liệu mou code của quan hệ hợp tác khoa–doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mou_file_url` | `TEXT` | Không | Đường dẫn tài nguyên mou file. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `valid_from` | `DATE` | Không | Dữ liệu valid from của quan hệ hợp tác khoa–doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `valid_to` | `DATE` | Không | Dữ liệu valid to của quan hệ hợp tác khoa–doanh nghiệp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `notes` | `TEXT` | Không | Ghi chú nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Quan hệ hợp tác Khoa–Doanh nghiệp thuộc/phụ trách bởi Khoa/Đơn vị đào tạo** qua `department_id`: bắt buộc đúng 1 Khoa/Đơn vị đào tạo.
- **Quan hệ hợp tác Khoa–Doanh nghiệp thuộc doanh nghiệp Doanh nghiệp** qua `company_id`: bắt buộc đúng 1 Doanh nghiệp.
- **Quan hệ hợp tác Khoa–Doanh nghiệp được phê duyệt bởi Tài khoản người dùng** qua `approved_by_user_id`: 0..1 Tài khoản người dùng.

### 3.11 Kỹ năng chuẩn hóa (`skills`)

- **Category:** MASTER DATA
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Từ điển kỹ năng dùng chung, có thể ánh xạ ESCO.
- **Business purpose:** Là ngôn ngữ chung để mô tả năng lực sinh viên và yêu cầu vị trí.
- **Primary identifier:** `id`.
- **Candidate key:** `name`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `VARCHAR(50)` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `name` **[Candidate key]** | `VARCHAR(100)` | Có | Tên hiển thị. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `category` | `VARCHAR(50)` | Có | Nhóm phân loại. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `esco_uri` | `VARCHAR(255)` | Không | Dữ liệu esco uri của kỹ năng chuẩn hóa. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `synonyms` | `TEXT` | Không | Các tên đồng nghĩa. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Kỹ năng chuẩn hóa có Yêu cầu kỹ năng của vị trí**: phía yêu cầu kỹ năng của vị trí là 0..N; FK `job_skills.skill_id`.
- **Kỹ năng chuẩn hóa có Kỹ năng của sinh viên**: phía kỹ năng của sinh viên là 0..N; FK `student_skills.skill_id`.

### 3.12 Vị trí thực tập (`jobs`)

- **Category:** BUSINESS ENTITY
- **Domain:** Tuyển dụng
- **Description:** Tin/vị trí thực tập do doanh nghiệp cung cấp và khoa kiểm duyệt.
- **Business purpose:** Mô tả cơ hội, chỉ tiêu, đối tượng, kết quả học tập mong đợi và vòng đời tuyển dụng.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `company_id` **[FK]** | `BIGINT` | Có | Tham chiếu Doanh nghiệp (`companies.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `department_id` **[FK]** | `BIGINT` | Không | Tham chiếu Khoa/Đơn vị đào tạo (`departments.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `title` | `VARCHAR(200)` | Có | Tiêu đề. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `description` | `TEXT` | Có | Mô tả. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `target_major` | `VARCHAR(100)` | Không | Dữ liệu target major của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `address_id` **[FK]** | `BIGINT` | Không | Tham chiếu Địa chỉ (`addresses.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `location_raw` | `VARCHAR(150)` | Không | Dữ liệu location raw của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `work_format` | `VARCHAR(30)` | Không | Dữ liệu work format của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `slots` | `INT` | Không | Dữ liệu slots của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `filled_slots` **[Derived/stored]** | `INT` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: filled slots. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `stipend_range` | `VARCHAR(100)` | Không | Dữ liệu stipend range của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `benefits` | `TEXT` | Không | Dữ liệu benefits của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `expected_learning_outcomes` | `TEXT` | Không | Dữ liệu expected learning outcomes của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `faculty_feedback` | `TEXT` | Không | Dữ liệu faculty feedback của vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `version` **[Technical/Audit]** | `INT` | Không | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `embedding` **[Derived/stored]** | `vector(768)` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: embedding. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Vị trí thực tập thuộc doanh nghiệp Doanh nghiệp** qua `company_id`: bắt buộc đúng 1 Doanh nghiệp.
- **Vị trí thực tập thuộc/phụ trách bởi Khoa/Đơn vị đào tạo** qua `department_id`: 0..1 Khoa/Đơn vị đào tạo.
- **Vị trí thực tập sử dụng địa chỉ Địa chỉ** qua `address_id`: 0..1 Địa chỉ.
- **Vị trí thực tập được phê duyệt bởi Tài khoản người dùng** qua `approved_by_user_id`: 0..1 Tài khoản người dùng.
- **Vị trí thực tập có Yêu cầu kỹ năng của vị trí**: phía yêu cầu kỹ năng của vị trí là 0..N; FK `job_skills.job_id`.
- **Vị trí thực tập có Hồ sơ ứng tuyển**: phía hồ sơ ứng tuyển là 0..N; FK `applications.job_id`.
- **Vị trí thực tập có Kết quả xếp hạng phù hợp**: phía kết quả xếp hạng phù hợp là 0..N; FK `matching_results.job_id`.

### 3.13 Yêu cầu kỹ năng của vị trí (`job_skills`)

- **Category:** REFERENCE ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Liên kết vị trí thực tập với kỹ năng và mức yêu cầu.
- **Business purpose:** Cung cấp đầu vào chuẩn hóa cho xếp hạng mức phù hợp.
- **Primary identifier:** Không xác định trong nguồn.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `job_id` **[FK]** | `BIGINT` | Có | Tham chiếu Vị trí thực tập (`jobs.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `skill_id` **[FK]** | `VARCHAR(50)` | Có | Tham chiếu Kỹ năng chuẩn hóa (`skills.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `is_mandatory` | `BOOLEAN` | Không | Cờ xác định mandatory. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `required_level` | `VARCHAR(30)` | Không | Dữ liệu required level của yêu cầu kỹ năng của vị trí. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |

**Relationships**

- **Yêu cầu kỹ năng của vị trí liên quan vị trí Vị trí thực tập** qua `job_id`: bắt buộc đúng 1 Vị trí thực tập.
- **Yêu cầu kỹ năng của vị trí tham chiếu kỹ năng Kỹ năng chuẩn hóa** qua `skill_id`: bắt buộc đúng 1 Kỹ năng chuẩn hóa.

### 3.14 Sinh viên trong danh sách chính thức (`student_rosters`)

- **Category:** REFERENCE ENTITY
- **Domain:** Danh tính & truy cập
- **Description:** Bản ghi sinh viên được nhập từ danh sách của trường.
- **Business purpose:** Kiểm soát đối tượng được kích hoạt tài khoản và tham gia kỳ thực tập.
- **Primary identifier:** `id`.
- **Candidate key:** `student_code`, `official_email`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `department_id` **[FK]** | `BIGINT` | Có | Tham chiếu Khoa/Đơn vị đào tạo (`departments.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_code` **[Candidate key]** | `VARCHAR(30)` | Có | Dữ liệu student code của sinh viên trong danh sách chính thức. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `official_email` **[Candidate key]** | `VARCHAR(150)` | Có | Dữ liệu official email của sinh viên trong danh sách chính thức. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `full_name` | `VARCHAR(150)` | Có | Họ và tên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `major` | `VARCHAR(100)` | Có | Dữ liệu major của sinh viên trong danh sách chính thức. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `academic_year` | `VARCHAR(20)` | Không | Dữ liệu academic year của sinh viên trong danh sách chính thức. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `class_code` | `VARCHAR(50)` | Không | Dữ liệu class code của sinh viên trong danh sách chính thức. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `gpa` | `NUMERIC(3, 2)` | Không | Dữ liệu gpa của sinh viên trong danh sách chính thức. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `is_claimed` | `BOOLEAN` | Không | Cờ xác định claimed. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `claimed_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `claimed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm claimed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Sinh viên trong danh sách chính thức thuộc/phụ trách bởi Khoa/Đơn vị đào tạo** qua `department_id`: bắt buộc đúng 1 Khoa/Đơn vị đào tạo.
- **Sinh viên trong danh sách chính thức tham chiếu qua claimed_user_id Tài khoản người dùng** qua `claimed_user_id`: 0..1 Tài khoản người dùng.

### 3.15 Hồ sơ sinh viên (`student_profiles`)

- **Category:** BUSINESS ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Hồ sơ học tập, chuyên ngành, sở thích và biểu diễn năng lực của sinh viên.
- **Business purpose:** Làm nguồn dữ liệu hồ sơ cho ứng tuyển và đối sánh.
- **Primary identifier:** `id`.
- **Candidate key:** `user_id`, `student_code`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `user_id` **[FK, Candidate key]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_code` **[Candidate key]** | `VARCHAR(30)` | Có | Dữ liệu student code của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `major` | `VARCHAR(100)` | Có | Dữ liệu major của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `academic_year` | `VARCHAR(20)` | Không | Dữ liệu academic year của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `gpa` | `NUMERIC(3, 2)` | Không | Dữ liệu gpa của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `passed_credits` | `INT` | Không | Dữ liệu passed credits của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `cv_file_url` | `TEXT` | Không | Đường dẫn tài nguyên cv file. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `portfolio_url` | `TEXT` | Không | Đường dẫn tài nguyên portfolio. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `github_url` | `TEXT` | Không | Đường dẫn tài nguyên github. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `linkedin_url` | `TEXT` | Không | Đường dẫn tài nguyên linkedin. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `bio_summary` | `TEXT` | Không | Dữ liệu bio summary của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `preferred_province_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tỉnh/Thành phố (`provinces.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `desired_position` | `VARCHAR(150)` | Không | Dữ liệu desired position của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `preferred_work_format` | `VARCHAR(30)` | Không | Dữ liệu preferred work format của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `data_sharing_consent` | `BOOLEAN` | Không | Dữ liệu data sharing consent của hồ sơ sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `internship_status` | `VARCHAR(30)` | Không | Trạng thái internship. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `embedding` **[Derived/stored]** | `vector(768)` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: embedding. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Hồ sơ sinh viên có người tham gia Tài khoản người dùng** qua `user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Hồ sơ sinh viên tham chiếu qua preferred_province_id Tỉnh/Thành phố** qua `preferred_province_id`: 0..1 Tỉnh/Thành phố.
- **Hồ sơ sinh viên có Kỹ năng của sinh viên**: phía kỹ năng của sinh viên là 0..N; FK `student_skills.student_profile_id`.
- **Hồ sơ sinh viên có Học phần của sinh viên**: phía học phần của sinh viên là 0..N; FK `student_courses.student_profile_id`.
- **Hồ sơ sinh viên có Chứng chỉ của sinh viên**: phía chứng chỉ của sinh viên là 0..N; FK `student_certificates.student_profile_id`.
- **Hồ sơ sinh viên có Phiên bản CV**: phía phiên bản cv là 0..N; FK `curriculum_vitaes.student_profile_id`.
- **Hồ sơ sinh viên có Đăng ký kỳ thực tập**: phía đăng ký kỳ thực tập là 0..N; FK `term_student_registrations.student_profile_id`.
- **Hồ sơ sinh viên có Phân công giảng viên hướng dẫn**: phía phân công giảng viên hướng dẫn là 0..N; FK `supervisor_assignments.student_profile_id`.
- **Hồ sơ sinh viên có Hồ sơ ứng tuyển**: phía hồ sơ ứng tuyển là 0..N; FK `applications.student_profile_id`.
- **Hồ sơ sinh viên có Kết quả xếp hạng phù hợp**: phía kết quả xếp hạng phù hợp là 0..N; FK `matching_results.student_profile_id`.

### 3.16 Kỹ năng của sinh viên (`student_skills`)

- **Category:** REFERENCE ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Liên kết sinh viên với kỹ năng, mức độ và nguồn minh chứng.
- **Business purpose:** Biểu diễn năng lực chuẩn hóa để đối sánh vị trí.
- **Primary identifier:** Không xác định trong nguồn.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `skill_id` **[FK]** | `VARCHAR(50)` | Có | Tham chiếu Kỹ năng chuẩn hóa (`skills.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `proficiency_level` | `VARCHAR(20)` | Có | Dữ liệu proficiency level của kỹ năng của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `years_experience` | `NUMERIC(3, 1)` | Không | Dữ liệu years experience của kỹ năng của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `verified_by_exam` | `BOOLEAN` | Không | Dữ liệu verified by exam của kỹ năng của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |

**Relationships**

- **Kỹ năng của sinh viên tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.
- **Kỹ năng của sinh viên tham chiếu kỹ năng Kỹ năng chuẩn hóa** qua `skill_id`: bắt buộc đúng 1 Kỹ năng chuẩn hóa.

### 3.17 Học phần của sinh viên (`student_courses`)

- **Category:** REFERENCE ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Thông tin học phần/kết quả học tập được dùng làm bằng chứng năng lực.
- **Business purpose:** Bổ sung tín hiệu học thuật cho hồ sơ và AI.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `course_code` | `VARCHAR(30)` | Có | Dữ liệu course code của học phần của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `course_name` | `VARCHAR(150)` | Có | Dữ liệu course name của học phần của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `grade` | `NUMERIC(3, 2)` | Không | Dữ liệu grade của học phần của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `credits` | `INT` | Không | Dữ liệu credits của học phần của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `semester` | `VARCHAR(30)` | Không | Dữ liệu semester của học phần của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |

**Relationships**

- **Học phần của sinh viên tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.

### 3.18 Chứng chỉ của sinh viên (`student_certificates`)

- **Category:** REFERENCE ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Chứng chỉ và thông tin xác minh của sinh viên.
- **Business purpose:** Bổ sung bằng chứng năng lực ngoài chương trình học.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `certificate_name` | `VARCHAR(150)` | Có | Dữ liệu certificate name của chứng chỉ của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `issuing_organization` | `VARCHAR(150)` | Không | Dữ liệu issuing organization của chứng chỉ của sinh viên. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `issue_date` | `DATE` | Không | Ngày issue. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `certificate_url` | `TEXT` | Không | Đường dẫn tài nguyên certificate. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |

**Relationships**

- **Chứng chỉ của sinh viên tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.

### 3.19 Phiên bản CV (`curriculum_vitaes`)

- **Category:** BUSINESS ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Các phiên bản CV do sinh viên cung cấp.
- **Business purpose:** Giữ tài liệu đầu vào có phiên bản cho trích xuất kỹ năng và ứng tuyển.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `file_name` | `VARCHAR(255)` | Có | Dữ liệu file name của phiên bản cv. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `file_url` | `TEXT` | Có | Đường dẫn tài nguyên file. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `parsed_text` | `TEXT` | Không | Dữ liệu parsed text của phiên bản cv. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `is_default` | `BOOLEAN` | Không | Cờ xác định default. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Phiên bản CV tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.
- **Phiên bản CV có Kết quả phân tích CV**: phía kết quả phân tích cv là 0..1; FK `cv_analysis.cv_id`.

### 3.20 Kết quả phân tích CV (`cv_analysis`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Kết quả AI trích xuất nội dung/kỹ năng từ một CV.
- **Business purpose:** Lưu đầu ra phân tích để giải thích và tái sử dụng trong hồ sơ năng lực.
- **Primary identifier:** `id`.
- **Candidate key:** `cv_id`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `cv_id` **[FK, Candidate key]** | `BIGINT` | Có | Tham chiếu Phiên bản CV (`curriculum_vitaes.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `extracted_skills` **[Derived/stored]** | `JSONB` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: extracted skills. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `education_info` | `TEXT` | Không | Dữ liệu education info của kết quả phân tích cv. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `experience_info` | `TEXT` | Không | Dữ liệu experience info của kết quả phân tích cv. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `ai_score` | `DOUBLE PRECISION` | Không | Điểm ai. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `model_name` | `VARCHAR(100)` | Không | Dữ liệu model name của kết quả phân tích cv. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Kết quả phân tích CV phân tích CV Phiên bản CV** qua `cv_id`: bắt buộc đúng 1 Phiên bản CV.

### 3.21 Kỳ thực tập (`internship_terms`)

- **Category:** BUSINESS ENTITY
- **Domain:** Quản lý học kỳ & phân công
- **Description:** Đợt thực tập do khoa tổ chức trong một khoảng thời gian.
- **Business purpose:** Đặt khung thời gian, quy định và trạng thái cho toàn bộ quy trình.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `name` | `VARCHAR(150)` | Có | Tên hiển thị. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `academic_year` | `VARCHAR(30)` | Có | Dữ liệu academic year của kỳ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `semester` | `INT` | Có | Dữ liệu semester của kỳ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `department_id` **[FK]** | `BIGINT` | Không | Tham chiếu Khoa/Đơn vị đào tạo (`departments.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `registration_start_date` | `DATE` | Có | Ngày registration start. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `registration_deadline` | `DATE` | Có | Dữ liệu registration deadline của kỳ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `internship_start_date` | `DATE` | Có | Ngày internship start. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `internship_end_date` | `DATE` | Có | Ngày internship end. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `max_credits` | `INT` | Không | Dữ liệu max credits của kỳ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Kỳ thực tập thuộc/phụ trách bởi Khoa/Đơn vị đào tạo** qua `department_id`: 0..1 Khoa/Đơn vị đào tạo.
- **Kỳ thực tập có Đăng ký kỳ thực tập**: phía đăng ký kỳ thực tập là 0..N; FK `term_student_registrations.internship_term_id`.
- **Kỳ thực tập có Phân công giảng viên hướng dẫn**: phía phân công giảng viên hướng dẫn là 0..N; FK `supervisor_assignments.internship_term_id`.
- **Kỳ thực tập có Thỏa thuận học tập**: phía thỏa thuận học tập là 0..N; FK `learning_agreements.internship_term_id`.
- **Kỳ thực tập có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.internship_term_id`.

### 3.22 Đăng ký kỳ thực tập (`term_student_registrations`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Quản lý học kỳ & phân công
- **Description:** Việc một sinh viên được ghi nhận tham gia một kỳ thực tập.
- **Business purpose:** Xác định phạm vi sinh viên hợp lệ của từng kỳ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `internship_term_id` **[FK]** | `BIGINT` | Có | Tham chiếu Kỳ thực tập (`internship_terms.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `course_class_code` | `VARCHAR(50)` | Không | Dữ liệu course class code của đăng ký kỳ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `is_eligible` | `BOOLEAN` | Không | Cờ xác định eligible. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `imported_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm imported. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Đăng ký kỳ thực tập tham chiếu qua internship_term_id Kỳ thực tập** qua `internship_term_id`: bắt buộc đúng 1 Kỳ thực tập.
- **Đăng ký kỳ thực tập tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.

### 3.23 Phân công giảng viên hướng dẫn (`supervisor_assignments`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Quản lý học kỳ & phân công
- **Description:** Phân công giảng viên phụ trách sinh viên trong một kỳ.
- **Business purpose:** Thiết lập trách nhiệm giám sát học thuật.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `internship_term_id` **[FK]** | `BIGINT` | Có | Tham chiếu Kỳ thực tập (`internship_terms.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `lecturer_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `assigned_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `assigned_date` | `DATE` | Không | Ngày assigned. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |

**Relationships**

- **Phân công giảng viên hướng dẫn tham chiếu qua internship_term_id Kỳ thực tập** qua `internship_term_id`: bắt buộc đúng 1 Kỳ thực tập.
- **Phân công giảng viên hướng dẫn tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.
- **Phân công giảng viên hướng dẫn tham chiếu qua lecturer_user_id Tài khoản người dùng** qua `lecturer_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Phân công giảng viên hướng dẫn tham chiếu qua assigned_by_user_id Tài khoản người dùng** qua `assigned_by_user_id`: 0..1 Tài khoản người dùng.
- **Phân công giảng viên hướng dẫn có Lịch sử phân công hướng dẫn**: phía lịch sử phân công hướng dẫn là 0..N; FK `assignment_histories.assignment_id`.

### 3.24 Lịch sử phân công hướng dẫn (`assignment_histories`)

- **Category:** AUDIT/TECHNICAL
- **Domain:** Quản lý học kỳ & phân công
- **Description:** Dấu vết thay đổi của một phân công giảng viên.
- **Business purpose:** Giải thích ai được đổi, lý do và thời điểm thay đổi.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `assignment_id` **[FK]** | `BIGINT` | Có | Tham chiếu Phân công giảng viên hướng dẫn (`supervisor_assignments.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `previous_lecturer_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `new_lecturer_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `changed_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reason` | `TEXT` | Có | Lý do nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `changed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm changed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Lịch sử phân công hướng dẫn tham chiếu qua assignment_id Phân công giảng viên hướng dẫn** qua `assignment_id`: bắt buộc đúng 1 Phân công giảng viên hướng dẫn.
- **Lịch sử phân công hướng dẫn tham chiếu qua previous_lecturer_id Tài khoản người dùng** qua `previous_lecturer_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Lịch sử phân công hướng dẫn tham chiếu qua new_lecturer_id Tài khoản người dùng** qua `new_lecturer_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Lịch sử phân công hướng dẫn tham chiếu qua changed_by_user_id Tài khoản người dùng** qua `changed_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.25 Hồ sơ ứng tuyển (`applications`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Tuyển dụng
- **Description:** Yêu cầu ứng tuyển của sinh viên vào một vị trí thực tập.
- **Business purpose:** Quản lý quá trình nộp, sàng lọc, phỏng vấn và quyết định tuyển.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `job_id` **[FK]** | `BIGINT` | Có | Tham chiếu Vị trí thực tập (`jobs.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `cover_letter` | `TEXT` | Không | Dữ liệu cover letter của hồ sơ ứng tuyển. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `ai_match_score` | `NUMERIC(5, 2)` | Không | Điểm ai match. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `offer_details` | `TEXT` | Không | Dữ liệu offer details của hồ sơ ứng tuyển. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `offer_deadline` | `TIMESTAMPTZ` | Không | Dữ liệu offer deadline của hồ sơ ứng tuyển. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `student_decision_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm student decision. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `applied_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm applied. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Hồ sơ ứng tuyển tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.
- **Hồ sơ ứng tuyển liên quan vị trí Vị trí thực tập** qua `job_id`: bắt buộc đúng 1 Vị trí thực tập.
- **Hồ sơ ứng tuyển có Lịch phỏng vấn**: phía lịch phỏng vấn là 0..N; FK `interviews.application_id`.
- **Hồ sơ ứng tuyển có Thỏa thuận học tập**: phía thỏa thuận học tập là 0..1; FK `learning_agreements.application_id`.
- **Hồ sơ ứng tuyển có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..N; FK `flyway_schema_history.application_id`.
- **Hồ sơ ứng tuyển có Lịch sử migration Flyway**: phía lịch sử migration flyway là 0..1; FK `flyway_schema_history.application_id`.

### 3.26 Kết quả xếp hạng phù hợp (`matching_results`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Hồ sơ năng lực & AI
- **Description:** Kết quả AI chấm mức phù hợp giữa sinh viên và vị trí.
- **Business purpose:** Cung cấp điểm, giải thích và xếp hạng hỗ trợ quyết định, không thay quyết định con người.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `job_id` **[FK]** | `BIGINT` | Có | Tham chiếu Vị trí thực tập (`jobs.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_profile_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ sinh viên (`student_profiles.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `skill_score` **[Derived/stored]** | `NUMERIC(5, 4)` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: skill score. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `semantic_score` | `NUMERIC(5, 4)` | Không | Điểm semantic. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `academic_score` **[Derived/stored]** | `NUMERIC(5, 4)` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: academic score. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `overall_score` **[Derived/stored]** | `NUMERIC(5, 4)` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: overall score. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `match_percentage` | `NUMERIC(5, 2)` | Không | Dữ liệu match percentage của kết quả xếp hạng phù hợp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `matched_skills` | `JSONB` | Không | Dữ liệu matched skills của kết quả xếp hạng phù hợp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `missing_skills` | `JSONB` | Không | Dữ liệu missing skills của kết quả xếp hạng phù hợp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `recommendation` | `TEXT` | Không | Dữ liệu recommendation của kết quả xếp hạng phù hợp. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `calculated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm calculated. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Kết quả xếp hạng phù hợp liên quan vị trí Vị trí thực tập** qua `job_id`: bắt buộc đúng 1 Vị trí thực tập.
- **Kết quả xếp hạng phù hợp tham chiếu qua student_profile_id Hồ sơ sinh viên** qua `student_profile_id`: bắt buộc đúng 1 Hồ sơ sinh viên.

### 3.27 Lịch phỏng vấn (`interviews`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Tuyển dụng
- **Description:** Một buổi phỏng vấn gắn với hồ sơ ứng tuyển.
- **Business purpose:** Quản lý lịch, hình thức, kết quả và phản hồi phỏng vấn.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `application_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ ứng tuyển (`applications.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `title` | `VARCHAR(200)` | Có | Tiêu đề. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `interview_type` | `VARCHAR(50)` | Không | Dữ liệu interview type của lịch phỏng vấn. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `scheduled_start` | `TIMESTAMPTZ` | Có | Dữ liệu scheduled start của lịch phỏng vấn. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `scheduled_end` | `TIMESTAMPTZ` | Không | Dữ liệu scheduled end của lịch phỏng vấn. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `meeting_url` | `VARCHAR(500)` | Không | Đường dẫn tài nguyên meeting. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `location_details` | `TEXT` | Không | Dữ liệu location details của lịch phỏng vấn. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `notes` | `TEXT` | Không | Ghi chú nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Lịch phỏng vấn phát sinh từ hồ sơ ứng tuyển Hồ sơ ứng tuyển** qua `application_id`: bắt buộc đúng 1 Hồ sơ ứng tuyển.
- **Lịch phỏng vấn được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Lịch phỏng vấn có Người tham gia phỏng vấn**: phía người tham gia phỏng vấn là 0..N; FK `interview_participants.interview_id`.

### 3.28 Người tham gia phỏng vấn (`interview_participants`)

- **Category:** REFERENCE ENTITY
- **Domain:** Tuyển dụng
- **Description:** Liên kết người dùng với buổi phỏng vấn và vai trò tham dự.
- **Business purpose:** Biểu diễn hội đồng/người tham gia của từng buổi.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `interview_id` **[FK]** | `BIGINT` | Có | Tham chiếu Lịch phỏng vấn (`interviews.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `participant_role` | `VARCHAR(50)` | Không | Dữ liệu participant role của người tham gia phỏng vấn. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `joined_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm joined. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |

**Relationships**

- **Người tham gia phỏng vấn tham gia buổi phỏng vấn Lịch phỏng vấn** qua `interview_id`: bắt buộc đúng 1 Lịch phỏng vấn.
- **Người tham gia phỏng vấn có người tham gia Tài khoản người dùng** qua `user_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.29 Thỏa thuận học tập (`learning_agreements`)

- **Category:** BUSINESS ENTITY
- **Domain:** Thỏa thuận & thực hiện
- **Description:** Cam kết ba bên về kỳ thực tập, mục tiêu học tập, giám sát và đánh giá.
- **Business purpose:** Là căn cứ học thuật và vận hành cho quá trình thực tập đã được chấp thuận.
- **Primary identifier:** `id`.
- **Candidate key:** `application_id`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `internship_term_id` **[FK]** | `BIGINT` | Không | Tham chiếu Kỳ thực tập (`internship_terms.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `application_id` **[FK, Candidate key]** | `BIGINT` | Có | Tham chiếu Hồ sơ ứng tuyển (`applications.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `academic_supervisor_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `company_mentor_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `educational_objectives` | `TEXT` | Có | Dữ liệu educational objectives của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `detailed_tasks` | `TEXT` | Có | Dữ liệu detailed tasks của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `knowledge_skills_to_acquire` | `TEXT` | Không | Dữ liệu knowledge skills to acquire của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `confidentiality_agreed` | `BOOLEAN` | Không | Dữ liệu confidentiality agreed của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `work_hours_per_week` | `INT` | Không | Dữ liệu work hours per week của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `start_date` | `DATE` | Có | Ngày bắt đầu. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `end_date` | `DATE` | Có | Ngày kết thúc. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `version` **[Technical/Audit]** | `INT` | Không | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `student_signed` | `BOOLEAN` | Không | Dữ liệu student signed của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `student_signed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm student signed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `mentor_signed` | `BOOLEAN` | Không | Dữ liệu mentor signed của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mentor_signed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm mentor signed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `supervisor_signed` | `BOOLEAN` | Không | Dữ liệu supervisor signed của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `supervisor_signed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm supervisor signed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `transferred_from_agreement_id` **[FK]** | `BIGINT` | Không | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `transferred_sessions_credited` | `INT` | Không | Dữ liệu transferred sessions credited của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `transferred_hours_credited` | `NUMERIC(5, 2)` | Không | Dữ liệu transferred hours credited của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `min_weeks_required` | `INT` | Không | Dữ liệu min weeks required của thỏa thuận học tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Thỏa thuận học tập tham chiếu qua internship_term_id Kỳ thực tập** qua `internship_term_id`: 0..1 Kỳ thực tập.
- **Thỏa thuận học tập phát sinh từ hồ sơ ứng tuyển Hồ sơ ứng tuyển** qua `application_id`: bắt buộc đúng 1 Hồ sơ ứng tuyển.
- **Thỏa thuận học tập thuộc sinh viên Tài khoản người dùng** qua `student_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Thỏa thuận học tập tham chiếu qua academic_supervisor_id Tài khoản người dùng** qua `academic_supervisor_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Thỏa thuận học tập có mentor doanh nghiệp Tài khoản người dùng** qua `company_mentor_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Thỏa thuận học tập tham chiếu qua transferred_from_agreement_id Thỏa thuận học tập** qua `transferred_from_agreement_id`: 0..1 Thỏa thuận học tập.
- **Thỏa thuận học tập có Thỏa thuận học tập**: phía thỏa thuận học tập là 0..N; FK `learning_agreements.transferred_from_agreement_id`.
- **Thỏa thuận học tập có Phụ lục thay đổi thỏa thuận**: phía phụ lục thay đổi thỏa thuận là 0..N; FK `agreement_amendments.learning_agreement_id`.
- **Thỏa thuận học tập có Lịch làm việc thực tập**: phía lịch làm việc thực tập là 0..N; FK `internship_work_schedules.learning_agreement_id`.
- **Thỏa thuận học tập có Đề xuất đổi lịch**: phía đề xuất đổi lịch là 0..N; FK `internship_schedule_proposals.learning_agreement_id`.
- **Thỏa thuận học tập có Yêu cầu chuyển nơi/vị trí thực tập**: phía yêu cầu chuyển nơi/vị trí thực tập là 0..N; FK `internship_transfer_requests.learning_agreement_id`.
- **Thỏa thuận học tập có Yêu cầu chuyển nơi/vị trí thực tập**: phía yêu cầu chuyển nơi/vị trí thực tập là 0..N; FK `internship_transfer_requests.new_learning_agreement_id`.
- **Thỏa thuận học tập có Yêu cầu kết thúc sớm**: phía yêu cầu kết thúc sớm là 0..N; FK `early_termination_requests.learning_agreement_id`.
- **Thỏa thuận học tập có Nhật ký thực tập**: phía nhật ký thực tập là 0..N; FK `logbooks.learning_agreement_id`.
- **Thỏa thuận học tập có Mục nhật ký**: phía mục nhật ký là 0..N; FK `logbook_entries.learning_agreement_id`.
- **Thỏa thuận học tập có Phiên chấm công**: phía phiên chấm công là 0..N; FK `attendance_sessions.learning_agreement_id`.
- **Thỏa thuận học tập có Yêu cầu sửa chấm công**: phía yêu cầu sửa chấm công là 0..N; FK `attendance_correction_requests.learning_agreement_id`.
- **Thỏa thuận học tập có Tranh chấp chấm công**: phía tranh chấp chấm công là 0..N; FK `attendance_disputes.learning_agreement_id`.
- **Thỏa thuận học tập có Ngoại lệ thực tập**: phía ngoại lệ thực tập là 0..N; FK `internship_exceptions.learning_agreement_id`.
- **Thỏa thuận học tập có Sự cố thực tập**: phía sự cố thực tập là 0..N; FK `internship_incidents.learning_agreement_id`.
- **Thỏa thuận học tập có Đối soát tuân thủ tuần**: phía đối soát tuân thủ tuần là 0..N; FK `weekly_compliance_records.learning_agreement_id`.
- **Thỏa thuận học tập có Phiếu đánh giá**: phía phiếu đánh giá là 0..N; FK `rubric_evaluations.learning_agreement_id`.
- **Thỏa thuận học tập có Khiếu nại kết quả thực tập**: phía khiếu nại kết quả thực tập là 0..N; FK `internship_appeals.learning_agreement_id`.
- **Thỏa thuận học tập có Khảo sát hài lòng**: phía khảo sát hài lòng là 0..N; FK `satisfaction_surveys.learning_agreement_id`.

### 3.30 Phụ lục thay đổi thỏa thuận (`agreement_amendments`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Thỏa thuận & thực hiện
- **Description:** Đề nghị và quyết định sửa đổi thỏa thuận học tập.
- **Business purpose:** Kiểm soát thay đổi mục tiêu, nhiệm vụ hoặc điều kiện trong quá trình thực tập.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `version_number` | `INT` | Có | Dữ liệu version number của phụ lục thay đổi thỏa thuận. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `reason_for_change` | `TEXT` | Có | Dữ liệu reason for change của phụ lục thay đổi thỏa thuận. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `changes_summary` | `JSONB` | Có | Dữ liệu changes summary của phụ lục thay đổi thỏa thuận. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_student` | `BOOLEAN` | Không | Dữ liệu approved by student của phụ lục thay đổi thỏa thuận. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_mentor` | `BOOLEAN` | Không | Dữ liệu approved by mentor của phụ lục thay đổi thỏa thuận. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_supervisor` | `BOOLEAN` | Không | Dữ liệu approved by supervisor của phụ lục thay đổi thỏa thuận. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `amended_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm amended. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Phụ lục thay đổi thỏa thuận tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.

### 3.31 Lịch làm việc thực tập (`internship_work_schedules`)

- **Category:** BUSINESS ENTITY
- **Domain:** Thỏa thuận & thực hiện
- **Description:** Lịch làm việc đã thống nhất cho một thỏa thuận.
- **Business purpose:** Làm chuẩn để chấm công và kiểm tra tuân thủ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `day_of_week` | `INT` | Có | Dữ liệu day of week của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `session_number` | `INT` | Có | Dữ liệu session number của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `start_time` | `TIME` | Có | Dữ liệu start time của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `end_time` | `TIME` | Có | Dữ liệu end time của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `work_format` | `VARCHAR(20)` | Có | Dữ liệu work format của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `version` **[Technical/Audit]** | `INT` | Có | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `is_active` | `BOOLEAN` | Có | Cờ cho phép hoạt động. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `effective_from` | `DATE` | Không | Dữ liệu effective from của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `effective_to` | `DATE` | Không | Dữ liệu effective to của lịch làm việc thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Lịch làm việc thực tập tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.

### 3.32 Đề xuất đổi lịch (`internship_schedule_proposals`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Thỏa thuận & thực hiện
- **Description:** Yêu cầu điều chỉnh lịch làm việc của sinh viên.
- **Business purpose:** Bảo đảm mọi thay đổi lịch được phê duyệt và truy vết.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `proposal_type` | `VARCHAR(20)` | Có | Dữ liệu proposal type của đề xuất đổi lịch. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `reason` | `TEXT` | Có | Lý do nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `effective_date` | `DATE` | Có | Ngày effective. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `proposed_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `schedule_items_json` | `TEXT` | Có | Dữ liệu schedule items json của đề xuất đổi lịch. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `reviewed_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `feedback` | `TEXT` | Không | Phản hồi. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Đề xuất đổi lịch tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Đề xuất đổi lịch tham chiếu qua proposed_by_user_id Tài khoản người dùng** qua `proposed_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Đề xuất đổi lịch tham chiếu qua reviewed_by_user_id Tài khoản người dùng** qua `reviewed_by_user_id`: 0..1 Tài khoản người dùng.

### 3.33 Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Ngoại lệ & bảo vệ
- **Description:** Yêu cầu chuyển thực tập khi quá trình đang diễn ra.
- **Business purpose:** Điều phối ngoại lệ chuyển tiếp mà không làm mất lịch sử.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `old_company_id` **[FK]** | `BIGINT` | Có | Tham chiếu Doanh nghiệp (`companies.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `new_company_id` **[FK]** | `BIGINT` | Không | Tham chiếu Doanh nghiệp (`companies.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reason` | `TEXT` | Có | Lý do nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `retained_sessions_count` | `INT` | Không | Số lượng retained sessions. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `retained_hours_count` | `NUMERIC(5, 2)` | Không | Số lượng retained hours. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `faculty_notes` | `TEXT` | Không | Dữ liệu faculty notes của yêu cầu chuyển nơi/vị trí thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `new_learning_agreement_id` **[FK]** | `BIGINT` | Không | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Yêu cầu chuyển nơi/vị trí thực tập tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Yêu cầu chuyển nơi/vị trí thực tập thuộc sinh viên Tài khoản người dùng** qua `student_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Yêu cầu chuyển nơi/vị trí thực tập tham chiếu qua old_company_id Doanh nghiệp** qua `old_company_id`: bắt buộc đúng 1 Doanh nghiệp.
- **Yêu cầu chuyển nơi/vị trí thực tập tham chiếu qua new_company_id Doanh nghiệp** qua `new_company_id`: 0..1 Doanh nghiệp.
- **Yêu cầu chuyển nơi/vị trí thực tập được phê duyệt bởi Tài khoản người dùng** qua `approved_by_user_id`: 0..1 Tài khoản người dùng.
- **Yêu cầu chuyển nơi/vị trí thực tập tham chiếu qua new_learning_agreement_id Thỏa thuận học tập** qua `new_learning_agreement_id`: 0..1 Thỏa thuận học tập.

### 3.34 Yêu cầu kết thúc sớm (`early_termination_requests`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Ngoại lệ & bảo vệ
- **Description:** Yêu cầu dừng kỳ thực tập trước thời hạn.
- **Business purpose:** Ghi nhận lý do, bên khởi tạo và quyết định xử lý nghỉ ngang/chấm dứt.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `initiated_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reason` | `TEXT` | Có | Lý do nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `last_working_date` | `DATE` | Có | Ngày last working. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `warning_evidence_url` | `VARCHAR(500)` | Không | Đường dẫn tài nguyên warning evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evaluation_summary` | `TEXT` | Không | Dữ liệu evaluation summary của yêu cầu kết thúc sớm. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `student_response` | `TEXT` | Không | Dữ liệu student response của yêu cầu kết thúc sớm. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `lecturer_verification` | `TEXT` | Không | Dữ liệu lecturer verification của yêu cầu kết thúc sớm. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `faculty_decision` | `VARCHAR(30)` | Không | Dữ liệu faculty decision của yêu cầu kết thúc sớm. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Yêu cầu kết thúc sớm tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Yêu cầu kết thúc sớm tham chiếu qua initiated_by_user_id Tài khoản người dùng** qua `initiated_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.35 Nhật ký thực tập (`logbooks`)

- **Category:** BUSINESS ENTITY
- **Domain:** Theo dõi thực tập
- **Description:** Sổ nhật ký tổng của sinh viên trong một thỏa thuận.
- **Business purpose:** Tập hợp báo cáo tiến độ và trạng thái duyệt nhật ký.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `week_number` | `INT` | Có | Dữ liệu week number của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `start_date` | `DATE` | Có | Ngày bắt đầu. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `end_date` | `DATE` | Có | Ngày kết thúc. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `tasks_performed` | `TEXT` | Có | Dữ liệu tasks performed của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `learned_skills` | `TEXT` | Không | Dữ liệu learned skills của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `hours_logged` | `NUMERIC(5, 1)` | Không | Dữ liệu hours logged của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `mentor_feedback` | `TEXT` | Không | Dữ liệu mentor feedback của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mentor_rating` | `INT` | Không | Dữ liệu mentor rating của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `supervisor_notes` | `TEXT` | Không | Dữ liệu supervisor notes của nhật ký thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `supervisor_reviewed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm supervisor reviewed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `submitted_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm nộp. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Nhật ký thực tập tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Nhật ký thực tập có Mục nhật ký**: phía mục nhật ký là 0..N; FK `logbook_entries.logbook_id`.

### 3.36 Mục nhật ký (`logbook_entries`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Theo dõi thực tập
- **Description:** Báo cáo công việc, học tập và phản ánh theo ngày/tuần.
- **Business purpose:** Cung cấp bằng chứng học tập tại nơi làm việc và dữ liệu theo dõi tiến độ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `logbook_id` **[FK]** | `BIGINT` | Không | Tham chiếu Nhật ký thực tập (`logbooks.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `work_date` | `DATE` | Có | Ngày work. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `session_number` | `INT` | Có | Dữ liệu session number của mục nhật ký. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `tasks_performed` | `TEXT` | Có | Dữ liệu tasks performed của mục nhật ký. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `skills_acquired` | `TEXT` | Không | Dữ liệu skills acquired của mục nhật ký. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `challenges_faced` | `TEXT` | Không | Dữ liệu challenges faced của mục nhật ký. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `hours_spent` | `NUMERIC(4, 2)` | Có | Dữ liệu hours spent của mục nhật ký. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Mục nhật ký thuộc nhật ký Nhật ký thực tập** qua `logbook_id`: 0..1 Nhật ký thực tập.
- **Mục nhật ký tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Mục nhật ký có Phiên chấm công**: phía phiên chấm công là 0..N; FK `attendance_sessions.logbook_entry_id`.

### 3.37 Phiên chấm công (`attendance_sessions`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Theo dõi thực tập
- **Description:** Một lần check-in/check-out của sinh viên.
- **Business purpose:** Ghi nhận hiện diện, vị trí, thời lượng và kết quả xác minh.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `work_date` | `DATE` | Có | Ngày work. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `session_number` | `INT` | Có | Dữ liệu session number của phiên chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `work_format` | `VARCHAR(20)` | Có | Dữ liệu work format của phiên chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `check_in_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm check in. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `check_out_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm check out. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `duration_minutes` **[Derived/stored]** | `INT` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: duration minutes. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `logbook_entry_id` **[FK]** | `BIGINT` | Không | Tham chiếu Mục nhật ký (`logbook_entries.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_note` | `TEXT` | Không | Dữ liệu student note của phiên chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_type` | `VARCHAR(50)` | Không | Dữ liệu evidence type của phiên chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mentor_status` | `VARCHAR(30)` | Có | Trạng thái mentor. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `mentor_confirmed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm mentor confirmed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `mentor_feedback` | `TEXT` | Không | Dữ liệu mentor feedback của phiên chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `is_make_up` | `BOOLEAN` | Không | Cờ xác định make up. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `make_up_for_date` | `DATE` | Không | Ngày make up for. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `is_offline_recorded` | `BOOLEAN` | Có | Cờ xác định offline recorded. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `client_recorded_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm client recorded. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `server_received_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm server received. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `is_locked` | `BOOLEAN` | Có | Cờ xác định locked. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `locked_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm locked. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Phiên chấm công tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Phiên chấm công tham chiếu qua logbook_entry_id Mục nhật ký** qua `logbook_entry_id`: 0..1 Mục nhật ký.
- **Phiên chấm công có Yêu cầu sửa chấm công**: phía yêu cầu sửa chấm công là 0..N; FK `attendance_correction_requests.attendance_session_id`.
- **Phiên chấm công có Tranh chấp chấm công**: phía tranh chấp chấm công là 0..N; FK `attendance_disputes.attendance_session_id`.
- **Phiên chấm công có Nhật ký kiểm toán chấm công**: phía nhật ký kiểm toán chấm công là 0..N; FK `attendance_audit_logs.attendance_session_id`.

### 3.38 Yêu cầu sửa chấm công (`attendance_correction_requests`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Theo dõi thực tập
- **Description:** Yêu cầu hiệu chỉnh một phiên chấm công.
- **Business purpose:** Cho phép sửa sai có phê duyệt và không mất dấu dữ liệu gốc.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `attendance_session_id` **[FK]** | `BIGINT` | Không | Tham chiếu Phiên chấm công (`attendance_sessions.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `work_date` | `DATE` | Có | Ngày work. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `session_number` | `INT` | Có | Dữ liệu session number của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `requested_check_in_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm requested check in. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `requested_check_out_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm requested check out. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `requested_duration_minutes` | `INT` | Không | Dữ liệu requested duration minutes của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `requested_work_format` | `VARCHAR(20)` | Không | Dữ liệu requested work format của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `tasks_performed` | `TEXT` | Không | Dữ liệu tasks performed của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `skills_acquired` | `TEXT` | Không | Dữ liệu skills acquired của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `challenges_faced` | `TEXT` | Không | Dữ liệu challenges faced của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `hours_spent` | `DOUBLE PRECISION` | Không | Dữ liệu hours spent của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_type` | `VARCHAR(50)` | Không | Dữ liệu evidence type của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `reason_for_correction` | `TEXT` | Có | Dữ liệu reason for correction của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `reviewed_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reviewed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm xem xét. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `mentor_feedback` | `TEXT` | Không | Dữ liệu mentor feedback của yêu cầu sửa chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Yêu cầu sửa chấm công điều chỉnh phiên chấm công Phiên chấm công** qua `attendance_session_id`: 0..1 Phiên chấm công.
- **Yêu cầu sửa chấm công tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Yêu cầu sửa chấm công thuộc sinh viên Tài khoản người dùng** qua `student_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Yêu cầu sửa chấm công tham chiếu qua reviewed_by_user_id Tài khoản người dùng** qua `reviewed_by_user_id`: 0..1 Tài khoản người dùng.

### 3.39 Tranh chấp chấm công (`attendance_disputes`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Ngoại lệ & bảo vệ
- **Description:** Khiếu nại/tranh chấp liên quan đến dữ liệu chấm công.
- **Business purpose:** Hỗ trợ xử lý bất đồng và ghi nhận quyết định.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `attendance_session_id` **[FK]** | `BIGINT` | Có | Tham chiếu Phiên chấm công (`attendance_sessions.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `dispute_reason` | `TEXT` | Có | Dữ liệu dispute reason của tranh chấp chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `VARCHAR(500)` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mentor_response` | `TEXT` | Không | Dữ liệu mentor response của tranh chấp chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `supervisor_proposal` | `TEXT` | Không | Dữ liệu supervisor proposal của tranh chấp chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `faculty_decision` | `TEXT` | Không | Dữ liệu faculty decision của tranh chấp chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `tier_level` | `INT` | Có | Dữ liệu tier level của tranh chấp chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `resolved_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm resolved. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Tranh chấp chấm công điều chỉnh phiên chấm công Phiên chấm công** qua `attendance_session_id`: bắt buộc đúng 1 Phiên chấm công.
- **Tranh chấp chấm công tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Tranh chấp chấm công thuộc sinh viên Tài khoản người dùng** qua `student_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.40 Nhật ký kiểm toán chấm công (`attendance_audit_logs`)

- **Category:** AUDIT/TECHNICAL
- **Domain:** Theo dõi thực tập
- **Description:** Dấu vết thay đổi dữ liệu chấm công.
- **Business purpose:** Bảo đảm khả năng kiểm tra ai đã thay đổi giá trị nào và khi nào.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `attendance_session_id` **[FK]** | `BIGINT` | Có | Tham chiếu Phiên chấm công (`attendance_sessions.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `action_type` | `VARCHAR(30)` | Có | Dữ liệu action type của nhật ký kiểm toán chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `field_name` | `VARCHAR(50)` | Không | Dữ liệu field name của nhật ký kiểm toán chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `old_value` | `TEXT` | Không | Dữ liệu old value của nhật ký kiểm toán chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `new_value` | `TEXT` | Không | Dữ liệu new value của nhật ký kiểm toán chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `change_reason` | `TEXT` | Không | Dữ liệu change reason của nhật ký kiểm toán chấm công. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `changed_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Nhật ký kiểm toán chấm công điều chỉnh phiên chấm công Phiên chấm công** qua `attendance_session_id`: bắt buộc đúng 1 Phiên chấm công.
- **Nhật ký kiểm toán chấm công tham chiếu qua changed_by_user_id Tài khoản người dùng** qua `changed_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.41 Ngoại lệ thực tập (`internship_exceptions`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Ngoại lệ & bảo vệ
- **Description:** Sự kiện ngoại lệ tổng quát phát sinh trong quá trình thực tập.
- **Business purpose:** Theo dõi loại sự cố, mức độ, xử lý và trạng thái khắc phục.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `week_number` | `INT` | Có | Dữ liệu week number của ngoại lệ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `exception_type` | `VARCHAR(40)` | Có | Dữ liệu exception type của ngoại lệ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `exempt_sessions_count` | `INT` | Có | Số lượng exempt sessions. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `start_date` | `DATE` | Có | Ngày bắt đầu. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `end_date` | `DATE` | Có | Ngày kết thúc. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `reason` | `TEXT` | Có | Lý do nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `proposed_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `proposed_by_role` | `VARCHAR(30)` | Có | Dữ liệu proposed by role của ngoại lệ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `approved_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `approved_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm phê duyệt. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `faculty_note` | `TEXT` | Không | Dữ liệu faculty note của ngoại lệ thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Ngoại lệ thực tập tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Ngoại lệ thực tập tham chiếu qua proposed_by_user_id Tài khoản người dùng** qua `proposed_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Ngoại lệ thực tập được phê duyệt bởi Tài khoản người dùng** qua `approved_by_user_id`: 0..1 Tài khoản người dùng.

### 3.42 Sự cố thực tập (`internship_incidents`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Ngoại lệ & bảo vệ
- **Description:** Sự cố an toàn, ứng xử hoặc vận hành tại nơi thực tập.
- **Business purpose:** Ghi nhận, phân loại và theo dõi xử lý sự cố.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reported_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `incident_type` | `VARCHAR(50)` | Có | Dữ liệu incident type của sự cố thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `description` | `TEXT` | Có | Mô tả. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `student_explanation` | `TEXT` | Không | Dữ liệu student explanation của sự cố thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `student_evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên student evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `severity` | `VARCHAR(20)` | Không | Dữ liệu severity của sự cố thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `resolution_status` | `VARCHAR(30)` | Không | Trạng thái resolution. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `resolution_notes` | `TEXT` | Không | Dữ liệu resolution notes của sự cố thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `resolved_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `reported_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm reported. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `resolved_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm resolved. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Sự cố thực tập tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Sự cố thực tập tham chiếu qua reported_by_user_id Tài khoản người dùng** qua `reported_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Sự cố thực tập tham chiếu qua resolved_by_user_id Tài khoản người dùng** qua `resolved_by_user_id`: 0..1 Tài khoản người dùng.
- **Sự cố thực tập có Đối soát tuân thủ tuần**: phía đối soát tuân thủ tuần là 0..N; FK `weekly_compliance_records.incident_id`.

### 3.43 Đối soát tuân thủ tuần (`weekly_compliance_records`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Theo dõi thực tập
- **Description:** Bản tổng hợp tuân thủ theo tuần từ lịch, công và nhật ký.
- **Business purpose:** Cảnh báo thiếu giờ, thiếu nhật ký hoặc sai lệch tiến độ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `week_number` | `INT` | Có | Dữ liệu week number của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `start_date` | `DATE` | Có | Ngày bắt đầu. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `end_date` | `DATE` | Có | Ngày kết thúc. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `required_sessions` | `INT` | Có | Dữ liệu required sessions của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `confirmed_sessions` | `INT` | Có | Dữ liệu confirmed sessions của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `make_up_sessions` | `INT` | Có | Dữ liệu make up sessions của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `exempt_sessions` | `INT` | Có | Dữ liệu exempt sessions của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Có | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `make_up_deadline` | `DATE` | Không | Dữ liệu make up deadline của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `consecutive_failed_weeks` | `INT` | Có | Dữ liệu consecutive failed weeks của đối soát tuân thủ tuần. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `incident_id` **[FK]** | `BIGINT` | Không | Tham chiếu Sự cố thực tập (`internship_incidents.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `evaluated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm evaluated. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Đối soát tuân thủ tuần tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Đối soát tuân thủ tuần tham chiếu qua incident_id Sự cố thực tập** qua `incident_id`: 0..1 Sự cố thực tập.

### 3.44 Năng lực NACE (`nace_competencies`)

- **Category:** MASTER DATA
- **Domain:** Đánh giá & công nhận
- **Description:** Danh mục năng lực nghề nghiệp NACE dùng trong rubric.
- **Business purpose:** Chuẩn hóa tiêu chí đánh giá năng lực đầu ra.
- **Primary identifier:** `code`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `code` **[PK]** | `VARCHAR(30)` | Có | Mã nghiệp vụ. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `name` | `VARCHAR(100)` | Có | Tên hiển thị. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `description` | `TEXT` | Không | Mô tả. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |

**Relationships**

- **Năng lực NACE có Điểm tiêu chí đánh giá**: phía điểm tiêu chí đánh giá là 0..N; FK `rubric_criteria_scores.competency_code`.

### 3.45 Phiếu đánh giá (`rubric_evaluations`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Đánh giá & công nhận
- **Description:** Một lần đánh giá sinh viên theo rubric bởi bên có thẩm quyền.
- **Business purpose:** Ghi nhận đánh giá giữa kỳ/cuối kỳ và tổng điểm.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `evaluation_type` | `VARCHAR(20)` | Có | Dữ liệu evaluation type của phiếu đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evaluator_role` | `VARCHAR(30)` | Có | Dữ liệu evaluator role của phiếu đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evaluator_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `total_score` **[Derived/stored]** | `NUMERIC(4, 2)` | Không | Giá trị được tính/sinh từ dữ liệu nguồn: total score. | Thuộc tính dẫn xuất/lưu đệm; cần quy tắc sinh và tái tính rõ ràng. |
| `strengths_observed` | `TEXT` | Không | Dữ liệu strengths observed của phiếu đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `areas_for_improvement` | `TEXT` | Không | Dữ liệu areas for improvement của phiếu đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `future_recommendations` | `TEXT` | Không | Dữ liệu future recommendations của phiếu đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evaluated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm evaluated. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Phiếu đánh giá tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Phiếu đánh giá tham chiếu qua evaluator_user_id Tài khoản người dùng** qua `evaluator_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Phiếu đánh giá có Điểm tiêu chí đánh giá**: phía điểm tiêu chí đánh giá là 0..N; FK `rubric_criteria_scores.evaluation_id`.

### 3.46 Điểm tiêu chí đánh giá (`rubric_criteria_scores`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Đánh giá & công nhận
- **Description:** Điểm và nhận xét cho từng năng lực trong một phiếu đánh giá.
- **Business purpose:** Giải thích tổng điểm và thể hiện năng lực chi tiết.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `evaluation_id` **[FK]** | `BIGINT` | Có | Tham chiếu Phiếu đánh giá (`rubric_evaluations.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `competency_code` **[FK]** | `VARCHAR(30)` | Có | Tham chiếu Năng lực NACE (`nace_competencies.code`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `score` | `NUMERIC(3, 1)` | Có | Điểm đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `behavioral_evidence` | `TEXT` | Không | Dữ liệu behavioral evidence của điểm tiêu chí đánh giá. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |

**Relationships**

- **Điểm tiêu chí đánh giá chi tiết hóa phiếu đánh giá Phiếu đánh giá** qua `evaluation_id`: bắt buộc đúng 1 Phiếu đánh giá.
- **Điểm tiêu chí đánh giá tham chiếu qua competency_code Năng lực NACE** qua `competency_code`: bắt buộc đúng 1 Năng lực NACE.

### 3.47 Khiếu nại kết quả thực tập (`internship_appeals`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Ngoại lệ & bảo vệ
- **Description:** Yêu cầu xem xét lại đánh giá hoặc quyết định liên quan thực tập.
- **Business purpose:** Cung cấp quy trình phản hồi, giải quyết và truy vết công bằng.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `appeal_type` | `VARCHAR(50)` | Có | Dữ liệu appeal type của khiếu nại kết quả thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `title` | `VARCHAR(255)` | Có | Tiêu đề. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `content` | `TEXT` | Có | Dữ liệu content của khiếu nại kết quả thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `evidence_url` | `TEXT` | Không | Đường dẫn tài nguyên evidence. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `status` | `VARCHAR(30)` | Không | Trạng thái vòng đời. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `response_content` | `TEXT` | Không | Dữ liệu response content của khiếu nại kết quả thực tập. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `handled_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `resolved_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm resolved. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Khiếu nại kết quả thực tập tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Khiếu nại kết quả thực tập tham chiếu qua student_user_id Tài khoản người dùng** qua `student_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Khiếu nại kết quả thực tập tham chiếu qua handled_by_user_id Tài khoản người dùng** qua `handled_by_user_id`: 0..1 Tài khoản người dùng.

### 3.48 Thông báo (`notifications`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Hỗ trợ hệ thống
- **Description:** Thông điệp hệ thống gửi đến người dùng.
- **Business purpose:** Thông báo sự kiện và yêu cầu hành động; không phải nguồn sự thật nghiệp vụ.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `title` | `VARCHAR(200)` | Có | Tiêu đề. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `content` | `TEXT` | Có | Dữ liệu content của thông báo. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `type` **[Technical/Audit]** | `VARCHAR(50)` | Không | Dữ liệu type của thông báo. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `is_read` | `BOOLEAN` | Không | Cờ xác định read. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `action_url` | `VARCHAR(500)` | Không | Đường dẫn tài nguyên action. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Thông báo có người tham gia Tài khoản người dùng** qua `user_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.49 Khảo sát hài lòng (`satisfaction_surveys`)

- **Category:** TRANSACTION ENTITY
- **Domain:** Đánh giá & công nhận
- **Description:** Phản hồi sau thực tập của các bên liên quan.
- **Business purpose:** Đo trải nghiệm và hỗ trợ cải tiến chương trình.
- **Primary identifier:** `id`.
- **Candidate key:** Chưa có khóa ứng viên đơn trong nguồn; khóa kết hợp cần xác nhận ở LDM/PDM.

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `learning_agreement_id` **[FK]** | `BIGINT` | Có | Tham chiếu Thỏa thuận học tập (`learning_agreements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `submitted_by_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `target_type` | `VARCHAR(50)` | Có | Dữ liệu target type của khảo sát hài lòng. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `satisfaction_score` | `INT` | Có | Điểm satisfaction. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `work_environment_rating` | `INT` | Không | Dữ liệu work environment rating của khảo sát hài lòng. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mentor_support_rating` | `INT` | Không | Dữ liệu mentor support rating của khảo sát hài lòng. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `would_recommend` | `BOOLEAN` | Không | Dữ liệu would recommend của khảo sát hài lòng. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `comments` | `TEXT` | Không | Dữ liệu comments của khảo sát hài lòng. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |

**Relationships**

- **Khảo sát hài lòng tham chiếu qua learning_agreement_id Thỏa thuận học tập** qua `learning_agreement_id`: bắt buộc đúng 1 Thỏa thuận học tập.
- **Khảo sát hài lòng tham chiếu qua submitted_by_user_id Tài khoản người dùng** qua `submitted_by_user_id`: bắt buộc đúng 1 Tài khoản người dùng.

### 3.50 Lịch sử migration Flyway (`flyway_schema_history`)

- **Category:** AUDIT/TECHNICAL
- **Domain:** Kỹ thuật
- **Description:** Bảng nội bộ do Flyway quản lý phiên bản lược đồ.
- **Business purpose:** Chỉ phục vụ triển khai cơ sở dữ liệu; loại khỏi CDM nghiệp vụ.
- **Primary identifier:** `id`, `id`, `id`, `id`, `id`, `id`.
- **Candidate key:** `application_id`, `accepted_offer_id`

| Attribute | Data Type | Mandatory | Description | Business Meaning |
|---|---|---:|---|---|
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `entity_type` | `VARCHAR(60)` | Có | Dữ liệu entity type của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `entity_id` | `BIGINT` | Có | Dữ liệu entity của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `old_state` | `VARCHAR(50)` | Không | Dữ liệu old state của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `new_state` | `VARCHAR(50)` | Có | Dữ liệu new state của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `changed_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `changed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm changed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `reason` | `TEXT` | Không | Lý do nghiệp vụ. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `correlation_id` | `VARCHAR(100)` | Không | Dữ liệu correlation của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `metadata` | `JSONB` | Có | Dữ liệu metadata của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `application_id` **[FK]** | `BIGINT` | Có | Tham chiếu Hồ sơ ứng tuyển (`applications.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `version` **[Technical/Audit]** | `INT` | Có | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `state` | `VARCHAR(30)` | Có | Dữ liệu state của lịch sử migration flyway. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `terms` | `TEXT` | Không | Dữ liệu terms của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `deadline` | `TIMESTAMPTZ` | Không | Dữ liệu deadline của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `sent_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `sent_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm sent. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `responded_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm responded. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `response_reason` | `TEXT` | Không | Dữ liệu response reason của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `updated_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `application_id` **[FK, Candidate key]** | `BIGINT` | Có | Tham chiếu Hồ sơ ứng tuyển (`applications.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `accepted_offer_id` **[FK, Candidate key]** | `BIGINT` | Không | Tham chiếu offers (`offers.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `internship_term_id` **[FK]** | `BIGINT` | Không | Tham chiếu Kỳ thực tập (`internship_terms.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `student_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `company_id` **[FK]** | `BIGINT` | Có | Tham chiếu Doanh nghiệp (`companies.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `company_mentor_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `academic_supervisor_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `state` | `VARCHAR(30)` | Có | Dữ liệu state của lịch sử migration flyway. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `start_date` | `DATE` | Không | Ngày bắt đầu. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `end_date` | `DATE` | Không | Ngày kết thúc. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `version` **[Technical/Audit]** | `INT` | Có | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `state_changed_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm state changed. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `state_changed_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `updated_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `owner_user_id` **[FK]** | `BIGINT` | Có | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `purpose` | `VARCHAR(40)` | Có | Dữ liệu purpose của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `state` | `VARCHAR(20)` | Có | Dữ liệu state của lịch sử migration flyway. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `version` **[Technical/Audit]** | `INT` | Có | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `storage_key` | `TEXT` | Có | Dữ liệu storage key của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `original_name` | `VARCHAR(255)` | Có | Dữ liệu original name của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `mime_type` | `VARCHAR(150)` | Không | Dữ liệu mime type của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `size_bytes` | `BIGINT` | Không | Dữ liệu size bytes của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `checksum_sha256` | `VARCHAR(64)` | Không | Dữ liệu checksum sha256 của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `source_type` | `VARCHAR(60)` | Không | Dữ liệu source type của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `source_id` | `BIGINT` | Không | Dữ liệu source của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `updated_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `OR` | `(source_type` | Có | Dữ liệu OR của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `document_id` **[FK]** | `BIGINT` | Có | Tham chiếu documents (`documents.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `entity_type` | `VARCHAR(60)` | Có | Dữ liệu entity type của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `entity_id` | `BIGINT` | Có | Dữ liệu entity của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `relation_type` | `VARCHAR(40)` | Có | Dữ liệu relation type của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `id` **[PK]** | `BIGSERIAL` | Có | Định danh kỹ thuật duy nhất. | Định danh bản ghi; số tự tăng không mang ý nghĩa nghiệp vụ. |
| `internship_placement_id` **[FK]** | `BIGINT` | Có | Tham chiếu internship_placements (`internship_placements.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `version` **[Technical/Audit]** | `INT` | Có | Phiên bản khóa lạc quan. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `state` | `VARCHAR(20)` | Có | Dữ liệu state của lịch sử migration flyway. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `total_score` | `NUMERIC(5, 2)` | Không | Điểm total. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `outcome` | `VARCHAR(30)` | Không | Dữ liệu outcome của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `credits_awarded` | `NUMERIC(5, 2)` | Không | Dữ liệu credits awarded của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `calculation_policy_version` | `VARCHAR(50)` | Không | Dữ liệu calculation policy version của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `rationale` | `TEXT` | Không | Dữ liệu rationale của lịch sử migration flyway. | Thuộc tính mô tả hoặc định lượng thực thể nghiệp vụ. |
| `finalized_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `finalized_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm finalized. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `published_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `published_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Không | Thời điểm published. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `created_by_user_id` **[FK, Technical/Audit]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `updated_by_user_id` **[FK]** | `BIGINT` | Không | Tham chiếu Tài khoản người dùng (`users.id`). | Thiết lập quan hệ và toàn vẹn tham chiếu với thực thể liên quan. |
| `created_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm tạo bản ghi. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `updated_at` **[Technical/Audit]** | `TIMESTAMPTZ` | Có | Thời điểm cập nhật gần nhất. | Thuộc tính kỹ thuật/audit; không phải khái niệm cốt lõi trên CDM. |
| `state` | `=` | Có | Dữ liệu state của lịch sử migration flyway. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |
| `state` | `<>` | Có | Dữ liệu state của lịch sử migration flyway. | Phản ánh vòng đời nghiệp vụ; cần từ điển trạng thái thống nhất. |

**Relationships**

- **Lịch sử migration Flyway tham chiếu qua changed_by_user_id Tài khoản người dùng** qua `changed_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway phát sinh từ hồ sơ ứng tuyển Hồ sơ ứng tuyển** qua `application_id`: bắt buộc đúng 1 Hồ sơ ứng tuyển.
- **Lịch sử migration Flyway tham chiếu qua sent_by_user_id Tài khoản người dùng** qua `sent_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua updated_by_user_id Tài khoản người dùng** qua `updated_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway phát sinh từ hồ sơ ứng tuyển Hồ sơ ứng tuyển** qua `application_id`: bắt buộc đúng 1 Hồ sơ ứng tuyển.
- **Lịch sử migration Flyway tham chiếu qua accepted_offer_id offers** qua `accepted_offer_id`: 0..1 offers.
- **Lịch sử migration Flyway tham chiếu qua internship_term_id Kỳ thực tập** qua `internship_term_id`: 0..1 Kỳ thực tập.
- **Lịch sử migration Flyway tham chiếu qua student_user_id Tài khoản người dùng** qua `student_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Lịch sử migration Flyway thuộc doanh nghiệp Doanh nghiệp** qua `company_id`: bắt buộc đúng 1 Doanh nghiệp.
- **Lịch sử migration Flyway có mentor doanh nghiệp Tài khoản người dùng** qua `company_mentor_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua academic_supervisor_id Tài khoản người dùng** qua `academic_supervisor_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua state_changed_by_user_id Tài khoản người dùng** qua `state_changed_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua updated_by_user_id Tài khoản người dùng** qua `updated_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua owner_user_id Tài khoản người dùng** qua `owner_user_id`: bắt buộc đúng 1 Tài khoản người dùng.
- **Lịch sử migration Flyway được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua updated_by_user_id Tài khoản người dùng** qua `updated_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua document_id documents** qua `document_id`: bắt buộc đúng 1 documents.
- **Lịch sử migration Flyway được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua internship_placement_id internship_placements** qua `internship_placement_id`: bắt buộc đúng 1 internship_placements.
- **Lịch sử migration Flyway tham chiếu qua finalized_by_user_id Tài khoản người dùng** qua `finalized_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua published_by_user_id Tài khoản người dùng** qua `published_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway được tạo bởi Tài khoản người dùng** qua `created_by_user_id`: 0..1 Tài khoản người dùng.
- **Lịch sử migration Flyway tham chiếu qua updated_by_user_id Tài khoản người dùng** qua `updated_by_user_id`: 0..1 Tài khoản người dùng.

## 4. Relationship Catalog

> Cardinality được đọc theo hướng Entity A → Entity B. `1 — 0..N` nghĩa là một A có thể liên hệ từ không đến nhiều B. Optionality ở đầu B được suy ra từ NULL/NOT NULL của FK. Tên quan hệ là ngôn ngữ nghiệp vụ; tên cột chỉ để truy vết PDM.

| Entity A | Relationship | Entity B | Cardinality | Optionality | Description |
|---|---|---|---|---|---|
| Quận/Huyện (`districts`) | thuộc | Tỉnh/Thành phố (`provinces`) | 0..N — 1 | A bắt buộc B | Mỗi quận/huyện phải tham chiếu một tỉnh/thành phố; một tỉnh/thành phố có thể có nhiều quận/huyện. FK vật lý: `districts.province_id`. |
| Phường/Xã (`wards`) | thuộc | Quận/Huyện (`districts`) | 0..N — 1 | A bắt buộc B | Mỗi phường/xã phải tham chiếu một quận/huyện; một quận/huyện có thể có nhiều phường/xã. FK vật lý: `wards.district_id`. |
| Địa chỉ (`addresses`) | định vị tại | Phường/Xã (`wards`) | 0..N — 1 | A tùy chọn B | Mỗi địa chỉ có thể tham chiếu một phường/xã; một phường/xã có thể có nhiều địa chỉ. FK vật lý: `addresses.ward_id`. |
| Trường đại học (`universities`) | sử dụng địa chỉ | Địa chỉ (`addresses`) | 0..N — 1 | A tùy chọn B | Mỗi trường đại học có thể tham chiếu một địa chỉ; một địa chỉ có thể có nhiều trường đại học. FK vật lý: `universities.address_id`. |
| Khoa/Đơn vị đào tạo (`departments`) | trực thuộc | Trường đại học (`universities`) | 0..N — 1 | A bắt buộc B | Mỗi khoa/đơn vị đào tạo phải tham chiếu một trường đại học; một trường đại học có thể có nhiều khoa/đơn vị đào tạo. FK vật lý: `departments.university_id`. |
| Tài khoản người dùng (`users`) | thuộc/phụ trách bởi | Khoa/Đơn vị đào tạo (`departments`) | 0..N — 1 | A tùy chọn B | Mỗi tài khoản người dùng có thể tham chiếu một khoa/đơn vị đào tạo; một khoa/đơn vị đào tạo có thể có nhiều tài khoản người dùng. FK vật lý: `users.department_id`. |
| Doanh nghiệp (`companies`) | sử dụng địa chỉ | Địa chỉ (`addresses`) | 0..N — 1 | A tùy chọn B | Mỗi doanh nghiệp có thể tham chiếu một địa chỉ; một địa chỉ có thể có nhiều doanh nghiệp. FK vật lý: `companies.address_id`. |
| Doanh nghiệp (`companies`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi doanh nghiệp có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều doanh nghiệp. FK vật lý: `companies.created_by_user_id`. |
| Lần thẩm định doanh nghiệp (`company_verifications`) | thuộc doanh nghiệp | Doanh nghiệp (`companies`) | 0..N — 1 | A bắt buộc B | Mỗi lần thẩm định doanh nghiệp phải tham chiếu một doanh nghiệp; một doanh nghiệp có thể có nhiều lần thẩm định doanh nghiệp. FK vật lý: `company_verifications.company_id`. |
| Lần thẩm định doanh nghiệp (`company_verifications`) | được thẩm định bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lần thẩm định doanh nghiệp phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lần thẩm định doanh nghiệp. FK vật lý: `company_verifications.reviewed_by_faculty_id`. |
| Quan hệ hợp tác Khoa–Doanh nghiệp (`department_company_partnerships`) | thuộc/phụ trách bởi | Khoa/Đơn vị đào tạo (`departments`) | 0..N — 1 | A bắt buộc B | Mỗi quan hệ hợp tác khoa–doanh nghiệp phải tham chiếu một khoa/đơn vị đào tạo; một khoa/đơn vị đào tạo có thể có nhiều quan hệ hợp tác khoa–doanh nghiệp. FK vật lý: `department_company_partnerships.department_id`. |
| Quan hệ hợp tác Khoa–Doanh nghiệp (`department_company_partnerships`) | thuộc doanh nghiệp | Doanh nghiệp (`companies`) | 0..N — 1 | A bắt buộc B | Mỗi quan hệ hợp tác khoa–doanh nghiệp phải tham chiếu một doanh nghiệp; một doanh nghiệp có thể có nhiều quan hệ hợp tác khoa–doanh nghiệp. FK vật lý: `department_company_partnerships.company_id`. |
| Quan hệ hợp tác Khoa–Doanh nghiệp (`department_company_partnerships`) | được phê duyệt bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi quan hệ hợp tác khoa–doanh nghiệp có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều quan hệ hợp tác khoa–doanh nghiệp. FK vật lý: `department_company_partnerships.approved_by_user_id`. |
| Vị trí thực tập (`jobs`) | thuộc doanh nghiệp | Doanh nghiệp (`companies`) | 0..N — 1 | A bắt buộc B | Mỗi vị trí thực tập phải tham chiếu một doanh nghiệp; một doanh nghiệp có thể có nhiều vị trí thực tập. FK vật lý: `jobs.company_id`. |
| Vị trí thực tập (`jobs`) | thuộc/phụ trách bởi | Khoa/Đơn vị đào tạo (`departments`) | 0..N — 1 | A tùy chọn B | Mỗi vị trí thực tập có thể tham chiếu một khoa/đơn vị đào tạo; một khoa/đơn vị đào tạo có thể có nhiều vị trí thực tập. FK vật lý: `jobs.department_id`. |
| Vị trí thực tập (`jobs`) | sử dụng địa chỉ | Địa chỉ (`addresses`) | 0..N — 1 | A tùy chọn B | Mỗi vị trí thực tập có thể tham chiếu một địa chỉ; một địa chỉ có thể có nhiều vị trí thực tập. FK vật lý: `jobs.address_id`. |
| Vị trí thực tập (`jobs`) | được phê duyệt bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi vị trí thực tập có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều vị trí thực tập. FK vật lý: `jobs.approved_by_user_id`. |
| Yêu cầu kỹ năng của vị trí (`job_skills`) | liên quan vị trí | Vị trí thực tập (`jobs`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu kỹ năng của vị trí phải tham chiếu một vị trí thực tập; một vị trí thực tập có thể có nhiều yêu cầu kỹ năng của vị trí. FK vật lý: `job_skills.job_id`. |
| Yêu cầu kỹ năng của vị trí (`job_skills`) | tham chiếu kỹ năng | Kỹ năng chuẩn hóa (`skills`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu kỹ năng của vị trí phải tham chiếu một kỹ năng chuẩn hóa; một kỹ năng chuẩn hóa có thể có nhiều yêu cầu kỹ năng của vị trí. FK vật lý: `job_skills.skill_id`. |
| Sinh viên trong danh sách chính thức (`student_rosters`) | thuộc/phụ trách bởi | Khoa/Đơn vị đào tạo (`departments`) | 0..N — 1 | A bắt buộc B | Mỗi sinh viên trong danh sách chính thức phải tham chiếu một khoa/đơn vị đào tạo; một khoa/đơn vị đào tạo có thể có nhiều sinh viên trong danh sách chính thức. FK vật lý: `student_rosters.department_id`. |
| Sinh viên trong danh sách chính thức (`student_rosters`) | tham chiếu qua claimed_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi sinh viên trong danh sách chính thức có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều sinh viên trong danh sách chính thức. FK vật lý: `student_rosters.claimed_user_id`. |
| Hồ sơ sinh viên (`student_profiles`) | có người tham gia | Tài khoản người dùng (`users`) | 0..1 — 1 | A bắt buộc B | Mỗi hồ sơ sinh viên phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có tối đa một hồ sơ sinh viên. FK vật lý: `student_profiles.user_id`. |
| Hồ sơ sinh viên (`student_profiles`) | tham chiếu qua preferred_province_id | Tỉnh/Thành phố (`provinces`) | 0..N — 1 | A tùy chọn B | Mỗi hồ sơ sinh viên có thể tham chiếu một tỉnh/thành phố; một tỉnh/thành phố có thể có nhiều hồ sơ sinh viên. FK vật lý: `student_profiles.preferred_province_id`. |
| Kỹ năng của sinh viên (`student_skills`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi kỹ năng của sinh viên phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều kỹ năng của sinh viên. FK vật lý: `student_skills.student_profile_id`. |
| Kỹ năng của sinh viên (`student_skills`) | tham chiếu kỹ năng | Kỹ năng chuẩn hóa (`skills`) | 0..N — 1 | A bắt buộc B | Mỗi kỹ năng của sinh viên phải tham chiếu một kỹ năng chuẩn hóa; một kỹ năng chuẩn hóa có thể có nhiều kỹ năng của sinh viên. FK vật lý: `student_skills.skill_id`. |
| Học phần của sinh viên (`student_courses`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi học phần của sinh viên phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều học phần của sinh viên. FK vật lý: `student_courses.student_profile_id`. |
| Chứng chỉ của sinh viên (`student_certificates`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi chứng chỉ của sinh viên phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều chứng chỉ của sinh viên. FK vật lý: `student_certificates.student_profile_id`. |
| Phiên bản CV (`curriculum_vitaes`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi phiên bản cv phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều phiên bản cv. FK vật lý: `curriculum_vitaes.student_profile_id`. |
| Kết quả phân tích CV (`cv_analysis`) | phân tích CV | Phiên bản CV (`curriculum_vitaes`) | 0..1 — 1 | A bắt buộc B | Mỗi kết quả phân tích cv phải tham chiếu một phiên bản cv; một phiên bản cv có thể có tối đa một kết quả phân tích cv. FK vật lý: `cv_analysis.cv_id`. |
| Kỳ thực tập (`internship_terms`) | thuộc/phụ trách bởi | Khoa/Đơn vị đào tạo (`departments`) | 0..N — 1 | A tùy chọn B | Mỗi kỳ thực tập có thể tham chiếu một khoa/đơn vị đào tạo; một khoa/đơn vị đào tạo có thể có nhiều kỳ thực tập. FK vật lý: `internship_terms.department_id`. |
| Đăng ký kỳ thực tập (`term_student_registrations`) | tham chiếu qua internship_term_id | Kỳ thực tập (`internship_terms`) | 0..N — 1 | A bắt buộc B | Mỗi đăng ký kỳ thực tập phải tham chiếu một kỳ thực tập; một kỳ thực tập có thể có nhiều đăng ký kỳ thực tập. FK vật lý: `term_student_registrations.internship_term_id`. |
| Đăng ký kỳ thực tập (`term_student_registrations`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi đăng ký kỳ thực tập phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều đăng ký kỳ thực tập. FK vật lý: `term_student_registrations.student_profile_id`. |
| Phân công giảng viên hướng dẫn (`supervisor_assignments`) | tham chiếu qua internship_term_id | Kỳ thực tập (`internship_terms`) | 0..N — 1 | A bắt buộc B | Mỗi phân công giảng viên hướng dẫn phải tham chiếu một kỳ thực tập; một kỳ thực tập có thể có nhiều phân công giảng viên hướng dẫn. FK vật lý: `supervisor_assignments.internship_term_id`. |
| Phân công giảng viên hướng dẫn (`supervisor_assignments`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi phân công giảng viên hướng dẫn phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều phân công giảng viên hướng dẫn. FK vật lý: `supervisor_assignments.student_profile_id`. |
| Phân công giảng viên hướng dẫn (`supervisor_assignments`) | tham chiếu qua lecturer_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi phân công giảng viên hướng dẫn phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều phân công giảng viên hướng dẫn. FK vật lý: `supervisor_assignments.lecturer_user_id`. |
| Phân công giảng viên hướng dẫn (`supervisor_assignments`) | tham chiếu qua assigned_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi phân công giảng viên hướng dẫn có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều phân công giảng viên hướng dẫn. FK vật lý: `supervisor_assignments.assigned_by_user_id`. |
| Lịch sử phân công hướng dẫn (`assignment_histories`) | tham chiếu qua assignment_id | Phân công giảng viên hướng dẫn (`supervisor_assignments`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử phân công hướng dẫn phải tham chiếu một phân công giảng viên hướng dẫn; một phân công giảng viên hướng dẫn có thể có nhiều lịch sử phân công hướng dẫn. FK vật lý: `assignment_histories.assignment_id`. |
| Lịch sử phân công hướng dẫn (`assignment_histories`) | tham chiếu qua previous_lecturer_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử phân công hướng dẫn phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử phân công hướng dẫn. FK vật lý: `assignment_histories.previous_lecturer_id`. |
| Lịch sử phân công hướng dẫn (`assignment_histories`) | tham chiếu qua new_lecturer_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử phân công hướng dẫn phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử phân công hướng dẫn. FK vật lý: `assignment_histories.new_lecturer_id`. |
| Lịch sử phân công hướng dẫn (`assignment_histories`) | tham chiếu qua changed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử phân công hướng dẫn phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử phân công hướng dẫn. FK vật lý: `assignment_histories.changed_by_user_id`. |
| Hồ sơ ứng tuyển (`applications`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi hồ sơ ứng tuyển phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều hồ sơ ứng tuyển. FK vật lý: `applications.student_profile_id`. |
| Hồ sơ ứng tuyển (`applications`) | liên quan vị trí | Vị trí thực tập (`jobs`) | 0..N — 1 | A bắt buộc B | Mỗi hồ sơ ứng tuyển phải tham chiếu một vị trí thực tập; một vị trí thực tập có thể có nhiều hồ sơ ứng tuyển. FK vật lý: `applications.job_id`. |
| Kết quả xếp hạng phù hợp (`matching_results`) | liên quan vị trí | Vị trí thực tập (`jobs`) | 0..N — 1 | A bắt buộc B | Mỗi kết quả xếp hạng phù hợp phải tham chiếu một vị trí thực tập; một vị trí thực tập có thể có nhiều kết quả xếp hạng phù hợp. FK vật lý: `matching_results.job_id`. |
| Kết quả xếp hạng phù hợp (`matching_results`) | tham chiếu qua student_profile_id | Hồ sơ sinh viên (`student_profiles`) | 0..N — 1 | A bắt buộc B | Mỗi kết quả xếp hạng phù hợp phải tham chiếu một hồ sơ sinh viên; một hồ sơ sinh viên có thể có nhiều kết quả xếp hạng phù hợp. FK vật lý: `matching_results.student_profile_id`. |
| Lịch phỏng vấn (`interviews`) | phát sinh từ hồ sơ ứng tuyển | Hồ sơ ứng tuyển (`applications`) | 0..N — 1 | A bắt buộc B | Mỗi lịch phỏng vấn phải tham chiếu một hồ sơ ứng tuyển; một hồ sơ ứng tuyển có thể có nhiều lịch phỏng vấn. FK vật lý: `interviews.application_id`. |
| Lịch phỏng vấn (`interviews`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lịch phỏng vấn phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch phỏng vấn. FK vật lý: `interviews.created_by_user_id`. |
| Người tham gia phỏng vấn (`interview_participants`) | tham gia buổi phỏng vấn | Lịch phỏng vấn (`interviews`) | 0..N — 1 | A bắt buộc B | Mỗi người tham gia phỏng vấn phải tham chiếu một lịch phỏng vấn; một lịch phỏng vấn có thể có nhiều người tham gia phỏng vấn. FK vật lý: `interview_participants.interview_id`. |
| Người tham gia phỏng vấn (`interview_participants`) | có người tham gia | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi người tham gia phỏng vấn phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều người tham gia phỏng vấn. FK vật lý: `interview_participants.user_id`. |
| Thỏa thuận học tập (`learning_agreements`) | tham chiếu qua internship_term_id | Kỳ thực tập (`internship_terms`) | 0..N — 1 | A tùy chọn B | Mỗi thỏa thuận học tập có thể tham chiếu một kỳ thực tập; một kỳ thực tập có thể có nhiều thỏa thuận học tập. FK vật lý: `learning_agreements.internship_term_id`. |
| Thỏa thuận học tập (`learning_agreements`) | phát sinh từ hồ sơ ứng tuyển | Hồ sơ ứng tuyển (`applications`) | 0..1 — 1 | A bắt buộc B | Mỗi thỏa thuận học tập phải tham chiếu một hồ sơ ứng tuyển; một hồ sơ ứng tuyển có thể có tối đa một thỏa thuận học tập. FK vật lý: `learning_agreements.application_id`. |
| Thỏa thuận học tập (`learning_agreements`) | thuộc sinh viên | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi thỏa thuận học tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều thỏa thuận học tập. FK vật lý: `learning_agreements.student_id`. |
| Thỏa thuận học tập (`learning_agreements`) | tham chiếu qua academic_supervisor_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi thỏa thuận học tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều thỏa thuận học tập. FK vật lý: `learning_agreements.academic_supervisor_id`. |
| Thỏa thuận học tập (`learning_agreements`) | có mentor doanh nghiệp | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi thỏa thuận học tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều thỏa thuận học tập. FK vật lý: `learning_agreements.company_mentor_id`. |
| Thỏa thuận học tập (`learning_agreements`) | tham chiếu qua transferred_from_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A tùy chọn B | Mỗi thỏa thuận học tập có thể tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều thỏa thuận học tập. FK vật lý: `learning_agreements.transferred_from_agreement_id`. |
| Phụ lục thay đổi thỏa thuận (`agreement_amendments`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi phụ lục thay đổi thỏa thuận phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều phụ lục thay đổi thỏa thuận. FK vật lý: `agreement_amendments.learning_agreement_id`. |
| Lịch làm việc thực tập (`internship_work_schedules`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi lịch làm việc thực tập phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều lịch làm việc thực tập. FK vật lý: `internship_work_schedules.learning_agreement_id`. |
| Đề xuất đổi lịch (`internship_schedule_proposals`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi đề xuất đổi lịch phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều đề xuất đổi lịch. FK vật lý: `internship_schedule_proposals.learning_agreement_id`. |
| Đề xuất đổi lịch (`internship_schedule_proposals`) | tham chiếu qua proposed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi đề xuất đổi lịch phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều đề xuất đổi lịch. FK vật lý: `internship_schedule_proposals.proposed_by_user_id`. |
| Đề xuất đổi lịch (`internship_schedule_proposals`) | tham chiếu qua reviewed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi đề xuất đổi lịch có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều đề xuất đổi lịch. FK vật lý: `internship_schedule_proposals.reviewed_by_user_id`. |
| Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu chuyển nơi/vị trí thực tập phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều yêu cầu chuyển nơi/vị trí thực tập. FK vật lý: `internship_transfer_requests.learning_agreement_id`. |
| Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`) | thuộc sinh viên | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu chuyển nơi/vị trí thực tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều yêu cầu chuyển nơi/vị trí thực tập. FK vật lý: `internship_transfer_requests.student_id`. |
| Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`) | tham chiếu qua old_company_id | Doanh nghiệp (`companies`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu chuyển nơi/vị trí thực tập phải tham chiếu một doanh nghiệp; một doanh nghiệp có thể có nhiều yêu cầu chuyển nơi/vị trí thực tập. FK vật lý: `internship_transfer_requests.old_company_id`. |
| Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`) | tham chiếu qua new_company_id | Doanh nghiệp (`companies`) | 0..N — 1 | A tùy chọn B | Mỗi yêu cầu chuyển nơi/vị trí thực tập có thể tham chiếu một doanh nghiệp; một doanh nghiệp có thể có nhiều yêu cầu chuyển nơi/vị trí thực tập. FK vật lý: `internship_transfer_requests.new_company_id`. |
| Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`) | được phê duyệt bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi yêu cầu chuyển nơi/vị trí thực tập có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều yêu cầu chuyển nơi/vị trí thực tập. FK vật lý: `internship_transfer_requests.approved_by_user_id`. |
| Yêu cầu chuyển nơi/vị trí thực tập (`internship_transfer_requests`) | tham chiếu qua new_learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A tùy chọn B | Mỗi yêu cầu chuyển nơi/vị trí thực tập có thể tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều yêu cầu chuyển nơi/vị trí thực tập. FK vật lý: `internship_transfer_requests.new_learning_agreement_id`. |
| Yêu cầu kết thúc sớm (`early_termination_requests`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu kết thúc sớm phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều yêu cầu kết thúc sớm. FK vật lý: `early_termination_requests.learning_agreement_id`. |
| Yêu cầu kết thúc sớm (`early_termination_requests`) | tham chiếu qua initiated_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu kết thúc sớm phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều yêu cầu kết thúc sớm. FK vật lý: `early_termination_requests.initiated_by_user_id`. |
| Nhật ký thực tập (`logbooks`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi nhật ký thực tập phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều nhật ký thực tập. FK vật lý: `logbooks.learning_agreement_id`. |
| Mục nhật ký (`logbook_entries`) | thuộc nhật ký | Nhật ký thực tập (`logbooks`) | 0..N — 1 | A tùy chọn B | Mỗi mục nhật ký có thể tham chiếu một nhật ký thực tập; một nhật ký thực tập có thể có nhiều mục nhật ký. FK vật lý: `logbook_entries.logbook_id`. |
| Mục nhật ký (`logbook_entries`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi mục nhật ký phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều mục nhật ký. FK vật lý: `logbook_entries.learning_agreement_id`. |
| Phiên chấm công (`attendance_sessions`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi phiên chấm công phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều phiên chấm công. FK vật lý: `attendance_sessions.learning_agreement_id`. |
| Phiên chấm công (`attendance_sessions`) | tham chiếu qua logbook_entry_id | Mục nhật ký (`logbook_entries`) | 0..N — 1 | A tùy chọn B | Mỗi phiên chấm công có thể tham chiếu một mục nhật ký; một mục nhật ký có thể có nhiều phiên chấm công. FK vật lý: `attendance_sessions.logbook_entry_id`. |
| Yêu cầu sửa chấm công (`attendance_correction_requests`) | điều chỉnh phiên chấm công | Phiên chấm công (`attendance_sessions`) | 0..N — 1 | A tùy chọn B | Mỗi yêu cầu sửa chấm công có thể tham chiếu một phiên chấm công; một phiên chấm công có thể có nhiều yêu cầu sửa chấm công. FK vật lý: `attendance_correction_requests.attendance_session_id`. |
| Yêu cầu sửa chấm công (`attendance_correction_requests`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu sửa chấm công phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều yêu cầu sửa chấm công. FK vật lý: `attendance_correction_requests.learning_agreement_id`. |
| Yêu cầu sửa chấm công (`attendance_correction_requests`) | thuộc sinh viên | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi yêu cầu sửa chấm công phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều yêu cầu sửa chấm công. FK vật lý: `attendance_correction_requests.student_id`. |
| Yêu cầu sửa chấm công (`attendance_correction_requests`) | tham chiếu qua reviewed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi yêu cầu sửa chấm công có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều yêu cầu sửa chấm công. FK vật lý: `attendance_correction_requests.reviewed_by_user_id`. |
| Tranh chấp chấm công (`attendance_disputes`) | điều chỉnh phiên chấm công | Phiên chấm công (`attendance_sessions`) | 0..N — 1 | A bắt buộc B | Mỗi tranh chấp chấm công phải tham chiếu một phiên chấm công; một phiên chấm công có thể có nhiều tranh chấp chấm công. FK vật lý: `attendance_disputes.attendance_session_id`. |
| Tranh chấp chấm công (`attendance_disputes`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi tranh chấp chấm công phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều tranh chấp chấm công. FK vật lý: `attendance_disputes.learning_agreement_id`. |
| Tranh chấp chấm công (`attendance_disputes`) | thuộc sinh viên | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi tranh chấp chấm công phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều tranh chấp chấm công. FK vật lý: `attendance_disputes.student_id`. |
| Nhật ký kiểm toán chấm công (`attendance_audit_logs`) | điều chỉnh phiên chấm công | Phiên chấm công (`attendance_sessions`) | 0..N — 1 | A bắt buộc B | Mỗi nhật ký kiểm toán chấm công phải tham chiếu một phiên chấm công; một phiên chấm công có thể có nhiều nhật ký kiểm toán chấm công. FK vật lý: `attendance_audit_logs.attendance_session_id`. |
| Nhật ký kiểm toán chấm công (`attendance_audit_logs`) | tham chiếu qua changed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi nhật ký kiểm toán chấm công phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều nhật ký kiểm toán chấm công. FK vật lý: `attendance_audit_logs.changed_by_user_id`. |
| Ngoại lệ thực tập (`internship_exceptions`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi ngoại lệ thực tập phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều ngoại lệ thực tập. FK vật lý: `internship_exceptions.learning_agreement_id`. |
| Ngoại lệ thực tập (`internship_exceptions`) | tham chiếu qua proposed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi ngoại lệ thực tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều ngoại lệ thực tập. FK vật lý: `internship_exceptions.proposed_by_user_id`. |
| Ngoại lệ thực tập (`internship_exceptions`) | được phê duyệt bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi ngoại lệ thực tập có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều ngoại lệ thực tập. FK vật lý: `internship_exceptions.approved_by_user_id`. |
| Sự cố thực tập (`internship_incidents`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi sự cố thực tập phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều sự cố thực tập. FK vật lý: `internship_incidents.learning_agreement_id`. |
| Sự cố thực tập (`internship_incidents`) | tham chiếu qua reported_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi sự cố thực tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều sự cố thực tập. FK vật lý: `internship_incidents.reported_by_user_id`. |
| Sự cố thực tập (`internship_incidents`) | tham chiếu qua resolved_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi sự cố thực tập có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều sự cố thực tập. FK vật lý: `internship_incidents.resolved_by_user_id`. |
| Đối soát tuân thủ tuần (`weekly_compliance_records`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi đối soát tuân thủ tuần phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều đối soát tuân thủ tuần. FK vật lý: `weekly_compliance_records.learning_agreement_id`. |
| Đối soát tuân thủ tuần (`weekly_compliance_records`) | tham chiếu qua incident_id | Sự cố thực tập (`internship_incidents`) | 0..N — 1 | A tùy chọn B | Mỗi đối soát tuân thủ tuần có thể tham chiếu một sự cố thực tập; một sự cố thực tập có thể có nhiều đối soát tuân thủ tuần. FK vật lý: `weekly_compliance_records.incident_id`. |
| Phiếu đánh giá (`rubric_evaluations`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi phiếu đánh giá phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều phiếu đánh giá. FK vật lý: `rubric_evaluations.learning_agreement_id`. |
| Phiếu đánh giá (`rubric_evaluations`) | tham chiếu qua evaluator_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi phiếu đánh giá phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều phiếu đánh giá. FK vật lý: `rubric_evaluations.evaluator_user_id`. |
| Điểm tiêu chí đánh giá (`rubric_criteria_scores`) | chi tiết hóa phiếu đánh giá | Phiếu đánh giá (`rubric_evaluations`) | 0..N — 1 | A bắt buộc B | Mỗi điểm tiêu chí đánh giá phải tham chiếu một phiếu đánh giá; một phiếu đánh giá có thể có nhiều điểm tiêu chí đánh giá. FK vật lý: `rubric_criteria_scores.evaluation_id`. |
| Điểm tiêu chí đánh giá (`rubric_criteria_scores`) | tham chiếu qua competency_code | Năng lực NACE (`nace_competencies`) | 0..N — 1 | A bắt buộc B | Mỗi điểm tiêu chí đánh giá phải tham chiếu một năng lực nace; một năng lực nace có thể có nhiều điểm tiêu chí đánh giá. FK vật lý: `rubric_criteria_scores.competency_code`. |
| Khiếu nại kết quả thực tập (`internship_appeals`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi khiếu nại kết quả thực tập phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều khiếu nại kết quả thực tập. FK vật lý: `internship_appeals.learning_agreement_id`. |
| Khiếu nại kết quả thực tập (`internship_appeals`) | tham chiếu qua student_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi khiếu nại kết quả thực tập phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều khiếu nại kết quả thực tập. FK vật lý: `internship_appeals.student_user_id`. |
| Khiếu nại kết quả thực tập (`internship_appeals`) | tham chiếu qua handled_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi khiếu nại kết quả thực tập có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều khiếu nại kết quả thực tập. FK vật lý: `internship_appeals.handled_by_user_id`. |
| Thông báo (`notifications`) | có người tham gia | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi thông báo phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều thông báo. FK vật lý: `notifications.user_id`. |
| Khảo sát hài lòng (`satisfaction_surveys`) | tham chiếu qua learning_agreement_id | Thỏa thuận học tập (`learning_agreements`) | 0..N — 1 | A bắt buộc B | Mỗi khảo sát hài lòng phải tham chiếu một thỏa thuận học tập; một thỏa thuận học tập có thể có nhiều khảo sát hài lòng. FK vật lý: `satisfaction_surveys.learning_agreement_id`. |
| Khảo sát hài lòng (`satisfaction_surveys`) | tham chiếu qua submitted_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi khảo sát hài lòng phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều khảo sát hài lòng. FK vật lý: `satisfaction_surveys.submitted_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua changed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.changed_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | phát sinh từ hồ sơ ứng tuyển | Hồ sơ ứng tuyển (`applications`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một hồ sơ ứng tuyển; một hồ sơ ứng tuyển có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.application_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua sent_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.sent_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.created_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua updated_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.updated_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | phát sinh từ hồ sơ ứng tuyển | Hồ sơ ứng tuyển (`applications`) | 0..1 — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một hồ sơ ứng tuyển; một hồ sơ ứng tuyển có thể có tối đa một lịch sử migration flyway. FK vật lý: `flyway_schema_history.application_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua accepted_offer_id | offers (`offers`) | 0..1 — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một offers; một offers có thể có tối đa một lịch sử migration flyway. FK vật lý: `flyway_schema_history.accepted_offer_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua internship_term_id | Kỳ thực tập (`internship_terms`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một kỳ thực tập; một kỳ thực tập có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.internship_term_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua student_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.student_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | thuộc doanh nghiệp | Doanh nghiệp (`companies`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một doanh nghiệp; một doanh nghiệp có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.company_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | có mentor doanh nghiệp | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.company_mentor_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua academic_supervisor_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.academic_supervisor_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua state_changed_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.state_changed_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.created_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua updated_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.updated_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua owner_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.owner_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.created_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua updated_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.updated_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua document_id | documents (`documents`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một documents; một documents có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.document_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.created_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua internship_placement_id | internship_placements (`internship_placements`) | 0..N — 1 | A bắt buộc B | Mỗi lịch sử migration flyway phải tham chiếu một internship_placements; một internship_placements có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.internship_placement_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua finalized_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.finalized_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua published_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.published_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | được tạo bởi | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.created_by_user_id`. |
| Lịch sử migration Flyway (`flyway_schema_history`) | tham chiếu qua updated_by_user_id | Tài khoản người dùng (`users`) | 0..N — 1 | A tùy chọn B | Mỗi lịch sử migration flyway có thể tham chiếu một tài khoản người dùng; một tài khoản người dùng có thể có nhiều lịch sử migration flyway. FK vật lý: `flyway_schema_history.updated_by_user_id`. |

### 4.1 Quan hệ cần Business Validation

| Vấn đề | Hiện trạng | Cần xác nhận |
|---|---|---|
| Mentor doanh nghiệp | `learning_agreements.company_mentor_id` trỏ thẳng đến `users`, nhưng `users` không liên kết doanh nghiệp. | Một mentor có thuộc đúng doanh nghiệp của vị trí/placement không; có được làm mentor cho nhiều doanh nghiệp không? |
| Sáu actor và vai trò | `users.role` là một giá trị đơn. | Một người có thể đồng thời là đại diện và mentor hay giảng viên kiêm quản lý khoa không? Nếu có, LDM cần mô hình vai trò nhiều-nhiều. |
| Chuyên ngành | `student_rosters.major`, `student_profiles.major`, `jobs.target_major` là text. | Quy tắc lọc tin theo khoa/chuyên ngành cần danh mục chuyên ngành chuẩn và quan hệ với department. |
| Chủ sở hữu địa chỉ | Trường, doanh nghiệp và vị trí cùng tham chiếu `addresses`; không có ownership. | Địa chỉ có được dùng chung hay mỗi chủ thể phải sở hữu một bản ghi riêng? |
| Placement đang bị ngầm hóa | Nhiều bảng thực hiện trỏ `learning_agreements`; chưa có thực thể placement trong 50 bảng. | Thỏa thuận có phải là bằng chứng pháp lý/học thuật, còn placement là lần thực tập vận hành riêng biệt? Khuyến nghị: có. |
| Offer đang nằm trong application | Quyết định nhận và điều kiện tiếp nhận chưa có thực thể riêng. | Doanh nghiệp có thể phát hành, sửa, hết hạn hoặc rút offer độc lập với application không? Khuyến nghị: có. |
| Minh chứng/tài liệu | URL tệp nằm rải ở CV, MOU, agreement, amendment, certificate và evidence. | Có cần quản lý metadata, quyền truy cập, phiên bản và liên kết tài liệu thống nhất không? Khuyến nghị: có. |
| Survey target | `satisfaction_surveys` cần xem lại khả năng định danh đối tượng/actor được đánh giá. | Mỗi khảo sát đánh giá chương trình, doanh nghiệp, mentor hay placement? |
| Ngoại lệ chồng lấn | Transfer, early termination, attendance dispute, appeal, incident và exception cùng xử lý tình huống bất thường. | `internship_exceptions` là hồ sơ bao (case) hay một loại sự kiện độc lập? |
| Lịch sử trạng thái | Mỗi module có status nhưng lịch sử phân tán. | State history chung chỉ lưu audit hay là bằng chứng nghiệp vụ được người dùng tra cứu? |

## 5. CDM Diagram Preparation

### 5.1 Danh sách thực thể nên đưa lên sơ đồ tổng quan

**Core organization:** Trường đại học, Khoa/Đơn vị đào tạo, Tài khoản người dùng, Doanh nghiệp, Quan hệ hợp tác Khoa–Doanh nghiệp.

**Recruitment and matching:** Sinh viên, Hồ sơ sinh viên, CV, Kỹ năng, Kỹ năng sinh viên, Vị trí thực tập, Yêu cầu kỹ năng vị trí, Kết quả xếp hạng phù hợp, Hồ sơ ứng tuyển, Phỏng vấn.

**Internship lifecycle:** Kỳ thực tập, Đăng ký kỳ thực tập, Phân công giảng viên, Offer (TO-BE), Placement (TO-BE), Thỏa thuận học tập, Lịch làm việc, Nhật ký thực tập, Mục nhật ký, Phiên chấm công.

**Quality and exceptions:** Ngoại lệ thực tập, Sự cố, Chuyển thực tập, Kết thúc sớm, Tranh chấp chấm công, Phiếu đánh giá, Điểm tiêu chí, Khiếu nại, Kết quả cuối cùng (TO-BE), Khảo sát hài lòng.

**Supporting concepts:** Tài liệu (TO-BE), Thông báo. Có thể ẩn các danh mục địa giới, bảng audit, bảng liên kết và chi tiết AI triển khai khỏi sơ đồ tổng quan.

### 5.2 Cụm sơ đồ đề nghị

1. **Organization & Identity CDM:** University — Department — User; Company — Partnership — Verification.
2. **Student Competency & AI CDM:** Student — Profile — CV — CV Analysis — Student Skill — Skill — Job Skill — Job — Matching Result.
3. **Recruitment CDM:** Internship Term — Student Registration — Job — Application — Interview — Offer.
4. **Internship Execution CDM:** Offer — Placement — Learning Agreement — Work Schedule — Logbook — Attendance — Supervision.
5. **Exception & Quality CDM:** Placement — Incident/Exception/Transfer/Termination — Evaluation — Appeal — Final Result — Survey.
6. **Document & Audit LDM/PDM:** Document — Document Link; State History. Không đặt Flyway trên sơ đồ nghiệp vụ.

### 5.3 Hướng dẫn vẽ trên Draw.io / ERDPlus / Lucidchart

- Dùng **tên thực thể khái niệm**, không dùng tên bảng snake_case làm nhãn chính.
- Trên CDM chỉ hiển thị định danh nghiệp vụ quan trọng: mã sinh viên, email, mã kỳ, mã doanh nghiệp/MST, mã vị trí nếu có.
- Dùng Crow's Foot và ghi cả hai đầu: `1`, `0..1`, `1..N`, `0..N`.
- Bảng liên kết như Student Skill, Job Skill, Interview Participant có thể vẽ thành associative entity khi bản thân nó có thuộc tính nghiệp vụ.
- Đánh màu theo domain, không theo loại bảng. Đánh dấu các quan hệ “Needs Business Validation” bằng nét đứt.
- Không đưa kiểu PostgreSQL, index, JSONB, vector hoặc Flyway lên CDM.

## 6. Review of Six TO-BE Entities

| Proposed Entity | Decision | Category | CDM Treatment | Rationale |
|---|---|---|---|---|
| `offers` / Đề nghị tiếp nhận | **KEEP** | BUSINESS ENTITY | Đưa vào CDM tuyển dụng giữa Application và Placement. | Tách quyết định/điều kiện tuyển của doanh nghiệp khỏi trạng thái hồ sơ ứng tuyển; cần cho phát hành, chấp nhận, từ chối, hết hạn và rút đề nghị. |
| `internship_placements` / Lần thực tập | **KEEP** | BUSINESS ENTITY | Là aggregate trung tâm của giai đoạn thực hiện. | Phân biệt “sinh viên được tiếp nhận và đang thực tập” với Application và Learning Agreement; cung cấp neo chung cho nhật ký, công, ngoại lệ, đánh giá và kết quả. |
| `documents` / Tài liệu | **KEEP** | BUSINESS ENTITY | Đưa vào CDM hỗ trợ ở mức khái niệm Document/Evidence. | Thay URL rải rác bằng metadata, chủ sở hữu, quyền truy cập và vòng đời tài liệu thống nhất; không thay nội dung nghiệp vụ của tài liệu. |
| `document_links` / Liên kết tài liệu | **KEEP - LDM/PDM ONLY** | REFERENCE ENTITY | Trên CDM biểu diễn bằng quan hệ Document “là minh chứng cho” thực thể nghiệp vụ. | Đây chủ yếu là cơ chế liên kết vật lý; mô hình polymorphic phải có kiểm soát toàn vẹn hoặc thay bằng các liên kết typed ở LDM. |
| `final_results` / Kết quả cuối cùng | **KEEP** | BUSINESS ENTITY | Đưa sau Evaluation/Appeal và gắn với Placement. | Tổng hợp quyết định công nhận cuối kỳ, tách khỏi từng phiếu rubric; là kết quả nghiệp vụ quan trọng của toàn trình. |
| `state_history` / Lịch sử chuyển trạng thái | **KEEP - AUDIT/LDM/PDM** | AUDIT/TECHNICAL | Có thể ẩn trên CDM tổng quan; thể hiện khi vẽ audit/lifecycle view. | Cần truy vết mọi chuyển trạng thái nhưng là cơ chế dùng chung. Liên kết polymorphic cần được kiểm soát và không được thay thế lịch sử chuyên ngành như assignment/attendance audit. |

### 6.1 Thứ tự khái niệm sau khi giữ sáu thực thể

`Application → Offer → Internship Placement → Learning Agreement / Execution Evidence → Evaluation → Final Result`.

Document liên kết xuyên suốt như minh chứng. State History ghi nhận chuyển trạng thái của các aggregate có vòng đời. Không xóa các cột/bảng cũ trong giai đoạn tương thích; việc hợp nhất chỉ được thực hiện sau mapping dữ liệu và kiểm chứng nghiệp vụ.

## 7. AI Domain Review

### 7.1 Chuỗi hiện trạng

| Workflow Stage | Existing Entity | Assessment |
|---|---|---|
| Student Profile | `student_profiles`, `student_courses`, `student_certificates`, `curriculum_vitaes` | Có đủ nguồn hồ sơ cơ bản, nhưng major và bằng chứng còn thiếu chuẩn hóa/metadata tài liệu. |
| Skill Extraction | `cv_analysis` | Có kết quả trích xuất và raw result; quan hệ hiện tại thiên về một kết quả cho một CV nên khó lưu lịch sử chạy lại/mô hình khác. |
| Skill Normalization | `skills`, `student_skills`, `job_skills`; `skills.esco_uri` | Có taxonomy và liên kết chuẩn hóa, nhưng thiếu provenance/confidence/mapping run rõ ràng. |
| Matching | `matching_results`, embedding ở profile/job | Có thành phần điểm và giải thích; unique pair hoặc cách lưu hiện tại có thể làm mất lịch sử tái chấm. |
| Recommendation | Có thể suy từ `matching_results.rank_position` | Chưa có thực thể recommendation/presentation riêng; có thể coi matching result là nguồn xếp hạng ở phạm vi hiện tại. |
| Feedback | Chưa có liên kết phản hồi AI trực tiếp | Kết quả application/placement/final result có thể là outcome gián tiếp nhưng chưa được mô hình hóa thành feedback cho mô hình. |

### 7.2 Các đề xuất còn thiếu - không tự động thêm vào mô hình hiện tại

- **Extraction Run / Model Version:** chỉ đề xuất nếu cần tái lập kết quả theo phiên bản model và prompt; không thay `cv_analysis` trước khi xác nhận yêu cầu lưu lịch sử.
- **Skill Mapping Evidence:** có thể bổ sung nguồn, confidence và đoạn văn bằng chứng vào liên kết kỹ năng; cần Business Validation về mức giải thích AI mong muốn.
- **Recommendation Feedback:** chỉ thêm khi có use case sinh viên/nhà tuyển dụng đánh dấu hữu ích, bỏ qua hoặc không phù hợp.
- **Normalized Major/Program:** cần cho lọc tin đúng khoa/chuyên ngành; nên dùng master data thay text tự do nhưng phải thống nhất với dữ liệu đào tạo CTU.
- **Matching Run:** đề xuất khi cần so sánh nhiều thuật toán hoặc tái chạy; hiện `matching_results` chưa thể hiện đầy đủ lịch sử mô hình.
- **Governance:** model version, input snapshot, consent, retention và quyền giải thích là thuộc tính quản trị AI cần đặc tả ở LDM/PDM, không nhất thiết là thực thể CDM mới.

## 8. Issues Found

### 8.1 Trùng lặp hoặc chồng vai trò

| Issue | Affected Data | Impact | Recommendation |
|---|---|---|---|
| Hồ sơ sinh viên lặp thông tin | `student_rosters` và `student_profiles` cùng có mã, họ tên, email, ngành/khoa. | Dễ lệch dữ liệu chính thức và dữ liệu tự cập nhật. | Xác định roster là nguồn nhập chính thức, profile là hồ sơ mở rộng; định nghĩa rõ trường nào được đồng bộ và trường nào sinh viên sửa. |
| CV được biểu diễn hai nơi | URL CV có thể xuất hiện ở application/profile trong khi có `curriculum_vitaes`. | Không rõ phiên bản CV nào được dùng khi ứng tuyển. | Application phải tham chiếu một CV/version cụ thể ở LDM; giữ tương thích dữ liệu cũ cho đến khi backfill xong. |
| Địa chỉ kép | `companies.address_id` + `address_raw`; `jobs.address_id` + `location_raw`. | Có thể hiển thị và lọc theo hai giá trị khác nhau. | Xác định raw là dữ liệu nhập tạm/legacy, structured address là nguồn chuẩn sau xác minh. |
| Trạng thái và lịch sử | Nhiều cột status cộng với các bảng history riêng. | Khó thống nhất transition và audit. | Chuẩn hóa từ điển trạng thái theo aggregate; state_history chung chỉ bổ trợ, không xóa audit chuyên ngành. |
| Agreement gánh vai trò placement | Nhật ký, công, ngoại lệ và đánh giá chủ yếu neo vào agreement. | Trộn cam kết học thuật với lần thực tập vận hành. | Giữ TO-BE Placement và thiết kế mapping tương thích trước khi chuyển FK. |
| Exception phân mảnh | Nhiều bảng yêu cầu/sự cố/khiếu nại cùng với `internship_exceptions`. | Không rõ record nào là case chính. | Xác định exception là case tổng quát hay bỏ khỏi CDM; không xóa bảng trước quyết định. |

### 8.2 Quan hệ còn thiếu hoặc mơ hồ

- Không có quan hệ rõ giữa tài khoản mentor/đại diện và doanh nghiệp.
- Không có master data Chương trình đào tạo/Ngành học để bảo đảm sinh viên chỉ thấy vị trí phù hợp khoa/ngành.
- Chưa có Placement trong 50 bảng nên không có một aggregate duy nhất cho toàn trình sau tuyển dụng.
- Chưa có quan hệ Final Result với các phiếu đánh giá, quyết định appeal và sự công nhận học vụ.
- Tài liệu/minh chứng đang dùng URL phân tán, thiếu ownership, classification, access policy và version.
- Phân công giảng viên gắn Student + Term, trong khi vận hành cần xác nhận nó áp dụng cho Placement nào.
- `matching_results` cần xác nhận một kết quả hiện hành hay lịch sử nhiều lần chạy.
- Các FK trỏ `users` không bảo đảm role phù hợp; đây là business invariant phải kiểm tra ở service/database rule phù hợp.

### 8.3 Thực thể/thuộc tính có nghĩa chưa rõ

- `departments.department_type`: cần từ điển phân biệt khoa, trường, bộ môn và phòng ban trong CTU.
- `companies.mou_status` có thể trùng nguồn sự thật với `department_company_partnerships.partnership_status`.
- `internship_exceptions` so với incident/transfer/termination/dispute/appeal cần xác định quan hệ tổng quát hóa/chuyên biệt hóa.
- `weekly_compliance_records` chứa dữ liệu tổng hợp; cần quy tắc tái tính và xử lý khi nhật ký/công thay đổi.
- `rubric_evaluations.total_score` là giá trị dẫn xuất từ criteria score; cần quy tắc làm tròn/trọng số.
- Các trường JSONB trong CV analysis/checklist linh hoạt nhưng không đại diện thuộc tính CDM ổn định.

### 8.4 Bảng kỹ thuật và audit

- `flyway_schema_history` không phải thực thể nghiệp vụ và phải loại khỏi sơ đồ CDM.
- `attendance_audit_logs`, `assignment_histories` và TO-BE `state_history` là audit entities; chỉ đưa vào sơ đồ lifecycle/audit chi tiết.
- Các trường `created_at`, `updated_at`, `version`, URL lưu trữ và `embedding` thuộc LDM/PDM; không làm nặng CDM.
- `notifications` là dữ liệu hỗ trợ giao tiếp, không được dùng làm bằng chứng duy nhất rằng một hành động nghiệp vụ đã xảy ra.

## 9. Architecture Review Conclusion

Mô hình 50 bảng hiện tại không phải 50 thực thể cốt lõi cần vẽ ngang hàng. Có **49 bảng hướng nghiệp vụ và 1 bảng kỹ thuật**, trong đó nhiều bảng là danh mục, bảng liên kết, transaction hoặc audit. CDM tổng quan nên tập trung khoảng 20-30 khái niệm chính và tách thành các sơ đồ miền; phụ lục chi tiết trong tài liệu này giữ đủ toàn bộ 50 bảng để truy vết.

Bốn TO-BE business entities **Offer, Internship Placement, Document và Final Result** lấp đúng bốn khoảng trống của toàn trình và nên giữ. **Document Link** và **State History** cũng nên giữ ở LDM/PDM nhưng không làm thực thể trung tâm trên CDM. Chưa có cơ sở để xóa bất kỳ bảng hiện trạng nào; những điểm chồng lấn cần Business Validation, mapping và kế hoạch tương thích dữ liệu trước khi hợp nhất.


