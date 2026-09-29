# InternLink — Cổng Quản Lý Thực Tập Tốt Nghiệp

Hệ thống quản lý toàn trình quy trình thực tập tốt nghiệp kết nối 3 bên: **Sinh viên — Doanh nghiệp tiếp nhận — Trường Đại học Cần Thơ (Trường CNTT&TT)**.

---

## 🔑 Danh Sách Tài Khoản Kiểm Thử Theo Vai Trò (Test Accounts)

Tất cả tài khoản kiểm thử đã được nạp sẵn vào cơ sở dữ liệu qua Flyway migration (`V8__seed_real_portal_accounts.sql`) với mật khẩu chuẩn đã băm BCrypt.

* **Mật khẩu chung cho tất cả tài khoản:** `Password@123`
* **Đường dẫn đăng nhập:** `http://localhost:3000/login`

| STT | Vai trò (Role) | Email đăng nhập | Mật khẩu | Họ và tên / Đơn vị | Ghi chú & Đường dẫn truy cập |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | **ADMIN** | `admin.cict@ctu.edu.vn` | `Password@123` | Quản trị viên Hệ thống CICT - CTU | Quản trị người dùng, cơ cấu khoa/ngành và nhật ký kiểm toán; xem danh bạ doanh nghiệp<br>👉 `/admin/dashboard` |
| **2** | **FACULTY_ADMIN** | `qltt.cict@ctu.edu.vn` | `Password@123` | Ban Quản lý Thực tập CICT | Thẩm định doanh nghiệp/tin tuyển dụng, kỳ thực tập, import roster Google Sheets, thông báo nhận giấy giới thiệu, phân công GVHD<br>👉 `/faculty/dashboard` |
| **3** | **LECTURER** | `gvhd.son@ctu.edu.vn` | `Password@123` | ThS. Nguyễn Thái Sơn (GVHD CICT) | Theo dõi thực tập sinh, nhận xét nhật ký tuần, chấm điểm Rubric & báo cáo CLO<br>👉 `/lecturer/dashboard` |
| **4** | **STUDENT** | `b2110940@student.ctu.edu.vn` | `Password@123` | Lê Hoàng Nam (MSSV: B2110940) | Hồ sơ kỹ năng, CV, đơn ứng tuyển, thỏa thuận 3 bên, nhật ký tuần, báo cáo & tra cứu điểm<br>👉 `/student/dashboard` |
| **5** | **COMPANY_REP** | `tuyendung.fptct@fpt.com` | `Password@123` | Lê Nguyễn Kim Ngân (HR FPT Software Cần Thơ) | Đăng tin tuyển dụng, sàng lọc ứng viên, lên lịch phỏng vấn, phát hành Offer, phân công Mentor<br>👉 `/company/dashboard` |
| **6** | **COMPANY_MENTOR** | `mentor.nam@fpt.com` | `Password@123` | Phạm Nhật Nam (Tech Lead & Mentor FPT) | Duyệt & phản hồi nhật ký tuần của thực tập sinh, đánh giá Rubric kết thúc kỳ thực tập<br>👉 `/mentor/dashboard` |

### ADMIN, quản lý khoa và Google Workspace

- **ADMIN:** tạo/xem/cập nhật khoa, ngành và tài khoản; xem nhật ký kiểm toán. Admin có thể xem danh bạ doanh nghiệp nhưng không thực hiện phê duyệt nghiệp vụ.
- **FACULTY_ADMIN:** thẩm định doanh nghiệp và tin tuyển dụng; tạo/chuyển trạng thái kỳ thực tập; import roster; thông báo sinh viên đến nhận **giấy giới thiệu bản cứng**; phân công GVHD khi kích hoạt thực tập và đổi GVHD cho placement đang hoạt động. Các thao tác kỳ, roster và GVHD được giới hạn theo khoa của tài khoản.
- **Google Sheets:** tại `/faculty/roster`, nhập link hoặc ID bảng và vùng dữ liệu. Dòng tiêu đề cần `studentCode`, `fullName`, `officialEmail`, `programCode`, `academicYear`, `internshipCourseCode`; có thể thêm `eligibilityStatus` (`ELIGIBLE`, `NEEDS_REVIEW`, `INELIGIBLE`) và `eligibilityNote`. Chia sẻ bảng cho email của service account.
- **Google Drive:** dùng `STORAGE_PROVIDER=GOOGLE_DRIVE` để lưu tài liệu qua Document API. Thư mục `GOOGLE_DRIVE_FOLDER_ID` cần nằm trong Shared Drive và cho service account quyền ghi. Mặc định vẫn dùng `LOCAL` khi chưa cấp quyền Google.
- **Gmail:** gửi thông báo nhận giấy giới thiệu từ hộp thư `GOOGLE_GMAIL_SENDER` qua Gmail API. Quản trị Google Workspace phải cấp domain-wide delegation cho service account với scope `https://www.googleapis.com/auth/gmail.send`.

Các biến môi trường BE: `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (đường dẫn file JSON ngoài Git), `GOOGLE_GMAIL_SENDER`, `GOOGLE_DRIVE_FOLDER_ID`, `STORAGE_PROVIDER`. Bật Sheets/Drive/Gmail API tương ứng. Scope Sheets là `https://www.googleapis.com/auth/spreadsheets.readonly`; scope Drive là `https://www.googleapis.com/auth/drive.file`. Khi thiếu cấu hình, API Google trả lỗi rõ ràng; không báo import hoặc gửi mail thành công giả. Xem thêm [Google service accounts](https://developers.google.com/identity/protocols/oauth2/service-account), [Sheets values](https://developers.google.com/workspace/sheets/api/guides/values), [Gmail sending](https://developers.google.com/workspace/gmail/api/guides/sending), [Shared Drives](https://developers.google.com/workspace/drive/api/guides/about-shareddrives).

---

## 🏛️ Danh Mục Các Phân Hệ & Đường Dẫn Chức Năng

### 1. Phân hệ Công khai (Public Portal)
* **Trang chủ Cổng thực tập**: `/`
* **Danh sách vị trí thực tập**: `/jobs`
* **Chi tiết tin tuyển dụng & Nộp đơn**: `/jobs/[id]`
* **Dành cho Doanh nghiệp & Hợp tác đào tạo**: `/doanh-nghiep`
* **Cẩm nang thực tập & Quy định**: `/cam-nang`
* **Đăng nhập hợp nhất**: `/login`

### 2. Cổng Sinh Viên (`STUDENT`)
* **Tổng quan thực tập**: `/student/dashboard`
* **Hồ sơ cá nhân & Kỹ năng (kèm tải CV PDF)**: `/student/profile`
* **Đơn ứng tuyển & Lịch phỏng vấn**: `/student/applications`
* **Thỏa thuận đào tạo thực tập 3 bên (Ký số điện tử)**: `/student/learning-agreement`
* **Nhật ký thực tập hàng tuần (Logbook)**: `/student/weekly-logs`
* **Nộp báo cáo cuối kỳ & Tra cứu bảng điểm tổng kết (CLO)**: `/student/final-report`

### 3. Cổng Doanh Nghiệp (`COMPANY_REP`)
* **Bàn làm việc doanh nghiệp**: `/company/dashboard`
* **Quản lý & Đăng tin tuyển dụng (Gửi Khoa duyệt)**: `/company/jobs`
* **Quản lý ứng viên (Xem CV, Lịch phỏng vấn, Gửi Offer)**: `/company/candidates`
* **Quản lý thực tập sinh & Phân công Mentor**: `/company/interns`

### 4. Cổng Cán Bộ Hướng Dẫn Doanh Nghiệp (`COMPANY_MENTOR`)
* **Bàn làm việc Mentor**: `/mentor/dashboard`
* **Duyệt & Đánh giá nhật ký tuần của TTS**: `/mentor/weekly-evaluations`
* **Chấm điểm Rubric kết thúc kỳ thực tập**: `/mentor/final-assessment`

### 5. Cổng Ban Quản Lý Thực Tập Khoa (`FACULTY_ADMIN`)
* **Bàn làm việc BQL Khoa**: `/faculty/dashboard`
* **Quản lý kỳ thực tập (Terms)**: `/faculty/terms`
* **Roster sinh viên đủ điều kiện tích lũy tín chỉ**: `/faculty/roster`
* **Thẩm định & Phê duyệt tin tuyển dụng**: `/faculty/job-approvals`
* **Phân công Giảng viên hướng dẫn (GVHD)**: `/faculty/assignments`

### 6. Cổng Giảng Viên Hướng Dẫn (`LECTURER`)
* **Bàn làm việc GVHD**: `/lecturer/dashboard`
* **Theo dõi & Nhận xét nhật ký thực tập**: `/lecturer/supervision`
* **Chấm điểm Rubric GVHD & Báo cáo CLO**: `/lecturer/grading`

### 7. Cổng Quản Trị Hệ Thống (`ADMIN`)
* **Bàn làm việc Quản trị viên**: `/admin/dashboard`
* **Quản lý người dùng & Phân quyền (RBAC 6 roles)**: `/admin/users`
* **Doanh nghiệp liên kết & Thẩm định MOU**: `/admin/companies`
* **Khoa chuyên môn & Ngành đào tạo (CICT)**: `/admin/departments`
* **Nhật ký kiểm toán bảo mật (Audit Logs)**: `/admin/audit-logs`

---

## 🚀 Hướng Dẫn Khởi Chạy Hệ Thống

### 1. Khởi chạy Backend (Spring Boot 3)

```bash
cd backend-core
mvn clean spring-boot:run
```
* Backend API hoạt động tại: `http://localhost:8080`
* Tài liệu Swagger UI: `http://localhost:8080/swagger-ui.html`

#### Java trong VS Code

Dự án dùng Lombok để sinh constructor, getter, setter và builder. Nếu `mvn clean test` thành công nhưng Problems báo hàng loạt lỗi như `variable ... not initialized in the default constructor`, hãy dùng Java Extension Pack (Red Hat Java Language Server) cho workspace này. Tại Extensions, chọn **Disable (Workspace)** cho `Oracle.oracle-java`, `georgewfraser.vscode-javac` và `vscjava.vscode-lombok` nếu đã cài; Red Hat Java đã hỗ trợ Lombok sẵn. Sau đó chạy **Developer: Reload Window** và **Java: Clean Java Language Server Workspace** từ Command Palette. File `.vscode/extensions.json` ghi lại lựa chọn extension cho dự án.

#### Quản lý migration database

Flyway kiểm tra checksum trước khi chạy migration mới. Không sửa, xóa hoặc đổi tên migration đã áp dụng, kể cả comment; thay đổi schema phải được viết trong migration có version mới. Kiểm thử `MigrationIntegrityTest` khóa checksum của V1–V12 để phát hiện thay đổi ngoài ý muốn.

Lỗi V11 với checksum database `-339308798` và local `976488499` do một dòng comment được thêm vào cuối file đã áp dụng. V11 đã được khôi phục đúng checksum gốc; thay đổi minh chứng điểm nằm riêng trong V12. Chạy lại lệnh backend ở trên để làm mới tài nguyên build và để Flyway áp dụng V12. Không cần `repair`, chỉnh `flyway_schema_history`, tắt validation hay xóa database.

Nếu gặp checksum khác, đối chiếu file với phiên bản đã áp dụng và kiểm tra schema trước khi xử lý; không đổi checksum mong đợi trong test chỉ để bỏ qua lỗi. Quy tắc migration: [Flyway versioned migrations](https://documentation.red-gate.com/fd/versioned-migrations-273973333.html).

### 2. Khởi chạy Frontend (Next.js 14)

```bash
cd frontend-web
npm install
npm run dev
```
* Ứng dụng Web hoạt động tại: `http://localhost:3000`

### 3. Chạy Kiểm Thử Unit Test (Vitest)

```bash
cd frontend-web
npm run test
```
* Chạy bộ kiểm thử gồm 16 test files và 46 test cases kiểm thử giao diện, phân quyền RoleGuard và các luồng nghiệp vụ.
