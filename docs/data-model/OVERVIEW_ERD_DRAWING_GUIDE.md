# Hướng dẫn vẽ ERD tổng quan CTU InternLink

## 1. Chọn loại sơ đồ

Sơ đồ bao phủ toàn bộ 26 bảng phải đặt tên là **ERD tổng quan dữ liệu nghiệp vụ** hoặc **LDM tổng quan**, không gọi là CDM thuần.

- CDM chỉ trình bày khái niệm nghiệp vụ, thường không có PK/FK và kiểu dữ liệu.
- ERD tổng quan hiển thị đủ bảng, PK/FK, lực lượng quan hệ và một số thuộc tính chính.
- ERD chi tiết/Physical Data Model mới hiển thị toàn bộ cột, kiểu PostgreSQL, index và constraint.

Không đưa `flyway_schema_history` và `user_sessions` vào ERD nghiệp vụ. Chúng là bảng hạ tầng kỹ thuật, không phải thực thể của miền quản lý thực tập.

## 2. Phạm vi sơ đồ chốt

ERD tổng quan có đúng **26 bảng nghiệp vụ**, chia thành 5 vùng:

| Vùng | Bảng |
|---|---|
| A. Tổ chức, tài khoản và kỳ thực tập | `departments`, `academic_programs`, `users`, `internship_terms`, `student_rosters`, `student_profiles` |
| B. Doanh nghiệp, tuyển dụng và AI | `companies`, `skill_taxonomies`, `student_skills`, `job_positions`, `job_skills`, `ai_runs`, `job_applications`, `placement_offers` |
| C. Khởi tạo và thực hiện thực tập | `learning_agreements`, `internship_placements`, `placement_tasks`, `attendance_logs`, `weekly_logbooks` |
| D. Ngoại lệ, đánh giá và kết quả | `internship_cases`, `rubric_evaluations`, `final_results` |
| E. Tài liệu, thông báo và truy vết | `documents`, `notifications`, `state_history`, `audit_logs` |

File nguồn tham chiếu: `LEAN_26_TABLE_OVERVIEW_ERD.puml`.

## 3. Thuộc tính được phép hiện trên sơ đồ tổng quan

Mỗi bảng chỉ hiện:

1. PK.
2. Các FK vật lý.
3. Mã/tên dùng nhận diện bản ghi.
4. `status` đối với bảng có vòng đời.
5. Thuộc tính đặc trưng cần để hiểu vai trò bảng, ví dụ `role`, `run_type`, `case_type`, `final_score`.

Không đưa `created_at`, `updated_at`, `version`, nội dung dài và toàn bộ JSONB lên hình tổng quan. Các cột đó vẫn tồn tại trong data dictionary và PDM.

## 4. Cách xử lý vòng liên kết

Vòng liên kết trong ERD không đồng nghĩa thiết kế sai. Hệ thống có nhiều vai trò cùng quy về `users`, nên các đường từ Mentor, GVHD, sinh viên và cán bộ Khoa cùng trở về bảng này là bình thường.

Áp dụng bốn quy tắc để hình không rối:

1. Đặt `users` gần trung tâm bên trái; không nhân bản bảng `users` thành sáu bảng actor.
2. Đặt chuỗi nghiệp vụ chính theo chiều trái sang phải: `job_positions -> job_applications -> placement_offers -> learning_agreements -> internship_placements -> final_results`.
3. Các bảng con của placement đặt ngay dưới `internship_placements`.
4. Không vẽ liên kết polymorphic từ bốn bảng hỗ trợ đến từng aggregate. Chỉ ghi chú `type + id` bằng nét đứt.

Quan hệ `student_profiles -> documents` đã được bỏ. CV hiện hành được tìm trong `documents` bằng `owner_user_id`, `document_type = 'CV'`, `is_current = true`; cách này loại một vòng FK và vẫn giữ lịch sử phiên bản CV.

## 5. Quan hệ nét liền và nét đứt

- **Nét liền:** cột có FK PostgreSQL thật.
- **Nét đứt/ghi chú:** quan hệ logical không có FK vật lý.

Bốn nhóm logical cần ghi chú, không kéo dây tới mọi bảng:

| Nguồn | Cách liên kết | Đích logical |
|---|---|---|
| `documents` | `context_type + context_id` | Profile, application, agreement, placement, task, logbook, evaluation hoặc case |
| `notifications` | `related_entity_type + related_entity_id` | Aggregate phát sinh thông báo |
| `state_history` | `entity_type + entity_id` | Aggregate có state machine |
| `audit_logs` | `entity_type + entity_id` | Đối tượng hệ thống được audit |

Quan hệ `job_positions` với `academic_programs` là M:N logical thông qua `target_program_codes JSONB`. Trên hình tổng quan chỉ cần một ghi chú nét đứt.

## 6. Cách dựng trong StarUML

1. Tạo `Data Model Diagram` hoặc `ER Diagram` và đặt tên `ERD Overview - CTU InternLink`.
2. Tạo năm package/vùng màu nhạt theo mục 2.
3. Thêm 26 entity theo đúng file PlantUML; chỉ nhập các thuộc tính đang hiển thị trong mỗi entity.
4. Dùng quan hệ identifying cho `student_skills`, `job_skills`, `student_profiles` vì FK tham gia PK; các FK còn lại dùng non-identifying relationship.
5. Ghi cardinality `0..1`, `1`, `0..N` ở hai đầu đúng như nhãn trong file PlantUML.
6. Thêm hai note cho quan hệ Job-Program và bốn bảng polymorphic.
7. Xuất ảnh ngang khổ A3 hoặc PDF landscape; không ép sơ đồ này vào A4 dọc.

## 7. Bộ sơ đồ nên nộp trong luận văn

1. **CDM nghiệp vụ:** khoảng 15-18 thực thể chính, không có bảng log/hạ tầng và không có kiểu dữ liệu.
2. **ERD tổng quan:** 26 bảng như tài liệu này, chỉ PK/FK và thuộc tính tiêu biểu.
3. **Data Dictionary/PDM:** toàn bộ cột và kiểu dữ liệu trong `LEAN_26_TABLE_CDM_DICTIONARY.md`.

Như vậy luận văn vừa giải thích được nghiệp vụ ở mức khái niệm, vừa chứng minh thiết kế dữ liệu đầy đủ mà không cần nhồi toàn bộ chi tiết vào một hình.
