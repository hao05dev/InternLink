# INTERNLINK RESTFUL API SPECIFICATION
## Quy Chuẩn Giao Tiếp Dữ Liệu & Tài Liệu API Toàn Trình
**Phiên bản**: 2.0 (Lean Modular Architecture)  
**Base URL**: `/api/v1`  
**Authentication**: Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. QUY CHUẨN CHUNG (GENERAL CONVENTIONS)

### 1.1. Cấu trúc chuẩn phản hồi (Standard Response Wrapper)

Mọi phản hồi từ hệ thống đều tuân thủ cấu trúc JSON thống nhất:

```json
{
  "success": true,
  "code": 200,
  "message": "Thao tác thành công",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2026-09-20T13:00:00Z"
}
```

Phản hồi khi có lỗi (Error Response):
```json
{
  "success": false,
  "code": 400,
  "message": "Trạng thái nghiệp vụ không hợp lệ",
  "errors": [
    {
      "field": "agreementStatus",
      "message": "Chỉ có thể phê duyệt khi hợp đồng đã có đủ chữ ký của Sinh viên và Doanh nghiệp"
    }
  ],
  "timestamp": "2026-09-20T13:00:00Z"
}
```

### 1.2. Bảng mã vai trò & Quyền hạn (Roles & RBAC)
* `STUDENT`: Sinh viên thực tập.
* `COMPANY_REP`: Đại diện / HR Doanh nghiệp.
* `COMPANY_MENTOR`: Người hướng dẫn tại Doanh nghiệp.
* `LECTURER`: Giảng viên hướng dẫn học thuật của Trường.
* `FACULTY_ADMIN`: Ban Quản lý Thực tập Khoa / Trưởng Bộ môn.
* `ADMIN`: Quản trị viên kỹ thuật.

---

## 2. MODULE M1: XÁC THỰC & ĐỊNH DANH (IAM & AUTH)

### 2.1. Đăng nhập hệ thống
* **Endpoint**: `POST /api/v1/auth/login`
* **Auth**: Public
* **Request Body**:
```json
{
  "email": "student@ctu.edu.vn",
  "password": "SecurePassword123!"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr_01J8...",
      "email": "student@ctu.edu.vn",
      "fullName": "Nguyễn Văn A",
      "role": "STUDENT"
    }
  }
}
```

### 2.2. Kích hoạt tài khoản sinh viên từ danh sách Khoa (Roster Claim)
* **Endpoint**: `POST /api/v1/auth/claim-student`
* **Auth**: Public
* **Request Body**:
```json
{
  "studentCode": "B2100001",
  "officialEmail": "a_b2100001@student.ctu.edu.vn",
  "password": "NewPassword123!",
  "phoneNumber": "0901234567"
}
```

### 2.3. Đăng ký tài khoản Doanh nghiệp mới
* **Endpoint**: `POST /api/v1/auth/register-company`
* **Auth**: Public
* **Request Body**:
```json
{
  "email": "hr@techcorp.vn",
  "password": "Password123!",
  "fullName": "Trần Thị Tuyển Dụng",
  "companyName": "Công ty Cổ phần Công nghệ TechCorp",
  "taxCode": "0109876543",
  "phoneNumber": "02923123456"
}
```

### 2.4. Lấy thông tin cá nhân hiện tại
* **Endpoint**: `GET /api/v1/auth/me`
* **Auth**: `Bearer JWT` (All Roles)

---

## 3. MODULE M2: DOANH NGHIỆP & VỊ TRÍ THỰC TẬP (ENTERPRISE & JOB SPECS)

### 3.1. Đăng tuyển vị trí thực tập mới
* **Endpoint**: `POST /api/v1/jobs`
* **Auth**: `COMPANY_REP`
* **Request Body**:
```json
{
  "title": "Thực tập sinh Lập trình Fullstack (React & Go)",
  "workFormat": "ONSITE",
  "location": "Ninh Kiều, Cần Thơ",
  "vacancies": 3,
  "description": "Tham gia phát triển dự án thực tế...",
  "requiredSkills": ["React", "TypeScript", "Go", "PostgreSQL"],
  "targetLearningOutcomes": ["Áp dụng Clean Architecture", "Kiểm thử tự động"],
  "stipendAmount": 3000000,
  "deadline": "2026-10-30T23:59:59Z"
}
```

### 3.2. Khoa phê duyệt / Yêu cầu sửa vị trí thực tập
* **Endpoint**: `POST /api/v1/faculty/jobs/{jobId}/review`
* **Auth**: `FACULTY_ADMIN`
* **Request Body**:
```json
{
  "action": "APPROVE", 
  "feedback": "Vị trí đáp ứng chuẩn đầu ra học phần thực tập tốt nghiệp."
}
```
*(Ghi chú: `action` có thể là `APPROVE` hoặc `REJECT`)*

### 3.3. Danh sách vị trí tuyển dụng công khai (kèm lọc)
* **Endpoint**: `GET /api/v1/jobs`
* **Auth**: Public / `STUDENT`
* **Query Params**: `?page=1&limit=10&keyword=React&workFormat=ONSITE`

---

## 4. MODULE M3: AI ĐỐI SÁNH & TUYỂN DỤNG (AI MATCHING & RECRUITMENT)

### 4.1. Lấy danh sách gợi ý việc làm có giải trình AI (Explainable AI Recommendations)
* **Endpoint**: `GET /api/v1/student/recommendations`
* **Auth**: `STUDENT`
* **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "jobId": "job_01J8...",
      "jobTitle": "Thực tập sinh Lập trình Fullstack",
      "companyName": "TechCorp",
      "overallScore": 88,
      "matchedSkills": ["React", "TypeScript", "PostgreSQL"],
      "missingSkills": ["Go", "Docker"],
      "explanation": "Hồ sơ của bạn đạt 88% mức tương thích. Kỹ năng frontend và CSDL rất vững, cần bổ sung thêm kiến thức backend Go."
    }
  ]
}
```

### 4.2. Sinh viên nộp hồ sơ ứng tuyển (Apply)
* **Endpoint**: `POST /api/v1/student/applications`
* **Auth**: `STUDENT`
* **Request Body**:
```json
{
  "jobId": "job_01J8...",
  "coverLetter": "Em mong muốn ứng tuyển vị trí này để hoàn thành học phần...",
  "cvUrl": "https://storage.internlink.ctu.edu.vn/cvs/b2100001_cv.pdf"
}
```

### 4.3. Doanh nghiệp lên lịch phỏng vấn
* **Endpoint**: `POST /api/v1/company/applications/{appId}/schedule-interview`
* **Auth**: `COMPANY_REP`
* **Request Body**:
```json
{
  "interviewAt": "2026-10-15T09:00:00Z",
  "interviewFormat": "ONLINE",
  "meetingUrl": "https://meet.google.com/abc-def-xyz",
  "notes": "Ứng viên chuẩn bị demo các dự án đã làm"
}
```

### 4.4. Doanh nghiệp gửi Thư mời tiếp nhận (Offer)
* **Endpoint**: `POST /api/v1/company/applications/{appId}/send-offer`
* **Auth**: `COMPANY_REP`
* **Request Body**:
```json
{
  "startDate": "2026-11-01",
  "endDate": "2027-01-31",
  "stipend": 3500000,
  "mentorName": "Lê Văn Mentor",
  "mentorEmail": "mentor@techcorp.vn",
  "expiresAt": "2026-10-25T23:59:59Z"
}
```

### 4.5. Sinh viên phản hồi Offer (Đồng ý / Từ chối)
* **Endpoint**: `POST /api/v1/student/offers/{offerId}/respond`
* **Auth**: `STUDENT`
* **Request Body**:
```json
{
  "decision": "ACCEPT",
  "note": "Em đồng ý tiếp nhận thực tập tại công ty."
}
```
*(Ghi chú: `decision` là `ACCEPT` hoặc `DECLINE`. Khi `ACCEPT`, hệ thống tự động khởi tạo bản nháp Thỏa thuận thực tập 3 bên)*

---

## 5. MODULE M4: THỎA THUẬN THỰC TẬP 3 BÊN (LEARNING AGREEMENT)

### 5.1. Lấy chi tiết Thỏa thuận 3 bên
* **Endpoint**: `GET /api/v1/agreements/{agreementId}`
* **Auth**: `STUDENT`, `COMPANY_REP`, `COMPANY_MENTOR`, `LECTURER`, `FACULTY_ADMIN`

### 5.2. Sinh viên ký xác nhận Thỏa thuận
* **Endpoint**: `POST /api/v1/agreements/{agreementId}/sign-student`
* **Auth**: `STUDENT`
* **Request Body**:
```json
{
  "confirmTerms": true,
  "digitalSignature": "NGUYEN VAN A - B2100001"
}
```

### 5.3. Doanh nghiệp ký xác nhận Thỏa thuận
* **Endpoint**: `POST /api/v1/agreements/{agreementId}/sign-company`
* **Auth**: `COMPANY_REP` / `COMPANY_MENTOR`
* **Request Body**:
```json
{
  "confirmMentorAssignment": true,
  "workplaceSafetyCompliance": true,
  "digitalSignature": "TRAN THI TUYEN DUNG - HR TECHCORP"
}
```

### 5.4. Khoa phê duyệt & Xác thực Thỏa thuận 3 bên
* **Endpoint**: `POST /api/v1/faculty/agreements/{agreementId}/approve`
* **Auth**: `FACULTY_ADMIN`
* **Request Body**:
```json
{
  "targetCredits": 10,
  "assignedLecturerId": "usr_lecturer_01",
  "decision": "APPROVE",
  "officialDecisionNumber": "QĐ-KCNTT-2026/01"
}
```

---

## 6. MODULE M5: CHẤM CÔNG & NHẬT KÝ THỰC TẬP (PLACEMENT & LOGBOOK)

### 6.1. Chấm công theo ca (Check-in / Check-out)
* **Endpoint**: `POST /api/v1/student/attendance/check-in`
* **Auth**: `STUDENT`
* **Request Body**:
```json
{
  "placementId": "plc_01J8...",
  "type": "CHECK_IN",
  "workFormat": "ONSITE",
  "latitude": 10.0299,
  "longitude": 105.7706,
  "deviceInfo": "Chrome PWA on Android"
}
```

### 6.2. Sinh viên nộp Nhật ký Thực tập tuần
* **Endpoint**: `POST /api/v1/student/logbooks`
* **Auth**: `STUDENT`
* **Request Body**:
```json
{
  "placementId": "plc_01J8...",
  "weekNumber": 3,
  "tasksCompleted": "Thiết kế API authentication và viết unit tests cho controller",
  "learningOutcomesReflected": ["Kỹ năng lập trình Go", "Kỹ năng làm việc nhóm"],
  "evidenceUrls": ["https://github.com/my-project/pull/12"],
  "hoursWorked": 38.5
}
```

### 6.3. Mentor Doanh nghiệp duyệt Nhật ký tuần
* **Endpoint**: `POST /api/v1/mentor/logbooks/{logbookId}/review`
* **Auth**: `COMPANY_MENTOR`
* **Request Body**:
```json
{
  "decision": "APPROVE",
  "mentorFeedback": "Hoàn thành tốt các task sprint tuần này, tuân thủ quy trình git",
  "competencyRating": "EXCEEDS_EXPECTATIONS"
}
```

### 6.4. Giảng viên phản hồi Nhật ký tuần
* **Endpoint**: `POST /api/v1/supervisor/logbooks/{logbookId}/feedback`
* **Auth**: `LECTURER`
* **Request Body**:
```json
{
  "academicComment": "Ghi nhận tiến độ. Cần lưu ý viết thêm phần tự phân tích rủi ro trong báo cáo cuối kỳ."
}
```

---

## 7. MODULE M6: ĐÁNH GIÁ RUBRIC & TỔNG HỢP ĐIỂM (EVALUATION & APPEALS)

### 7.1. Gửi Phiếu Đánh giá Rubric NACE (Giữa kỳ / Cuối kỳ)
* **Endpoint**: `POST /api/v1/evaluations/rubric`
* **Auth**: `COMPANY_MENTOR` / `LECTURER`
* **Request Body**:
```json
{
  "placementId": "plc_01J8...",
  "evaluatorRole": "COMPANY_MENTOR",
  "stage": "FINAL",
  "criteria": [
    { "competency": "CRITICAL_THINKING", "score": 9.0, "evidenceComment": "Chủ động đề xuất giải pháp tối ưu query" },
    { "competency": "COMMUNICATION", "score": 8.5, "evidenceComment": "Báo cáo rõ ràng trong các buổi daily standup" },
    { "competency": "TEAMWORK", "score": 9.5, "evidenceComment": "Hỗ trợ thành viên mới tốt" },
    { "competency": "PROFESSIONALISM", "score": 10.0, "evidenceComment": "Chấp hành kỷ luật và bảo mật tuyệt đối" }
  ],
  "finalScore": 9.25,
  "qualitativeFeedback": "Sinh viên có năng lực chuyên môn và thái độ làm việc xuất sắc."
}
```

### 7.2. Sinh viên gửi đơn Phúc khảo điểm số
* **Endpoint**: `POST /api/v1/student/appeals`
* **Auth**: `STUDENT`
* **Request Body**:
```json
{
  "placementId": "plc_01J8...",
  "reason": "Điểm phần Kỹ năng Giao tiếp chưa phản ánh đủ minh chứng buổi demo cuối kỳ",
  "supportingDocuments": ["https://storage.internlink.ctu.edu.vn/appeals/demo_record.pdf"]
}
```

### 7.3. Hội đồng Khoa chốt kết quả Phúc khảo
* **Endpoint**: `POST /api/v1/faculty/appeals/{appealId}/resolve`
* **Auth**: `FACULTY_ADMIN`
* **Request Body**:
```json
{
  "decision": "ADJUST_GRADE",
  "newFinalGrade": 8.8,
  "councilResolution": "Hội đồng chấp thuận bổ sung minh chứng từ buổi demo sản phẩm."
}
```
