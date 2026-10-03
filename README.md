# 🎓 InternLink — Cổng Quản Lý Thực Tập Tốt Nghiệp

> **Nền tảng quản lý toàn trình quy trình thực tập tốt nghiệp**, kết nối đồng bộ 3 bên: **Sinh viên — Doanh nghiệp tiếp nhận — Trường Đại học Cần Thơ (Trường CNTT&TT - CICT)**.

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.x-6DB33F?logo=springboot&logoColor=white)](backend-core)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js&logoColor=white)](frontend-web)
[![FastAPI](https://img.shields.io/badge/AI%20Service-FastAPI-009688?logo=fastapi&logoColor=white)](ai-service)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql&logoColor=white)](backend-core)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript&logoColor=white)](frontend-web)
[![Java](https://img.shields.io/badge/Language-Java%2021-ED8B00?logo=openjdk&logoColor=white)](backend-core)
[![Python](https://img.shields.io/badge/Language-Python%203.10+-3776AB?logo=python&logoColor=white)](ai-service)

---

## 🚀 Tính Năng Chính

* **Đồng bộ quy trình 3 bên**: Quản lý trọn gói từ xét duyệt điều kiện, ứng tuyển, phỏng vấn, ký thỏa thuận thực tập đến đánh giá Rubric & cấp chứng nhận.
* **Tích hợp AI thông minh**: Trích xuất dữ liệu CV và gợi ý mức độ phù hợp công việc (AI Matching Score) cho sinh viên và nhà tuyển dụng.
* **Tích hợp Google Workspace**: Hỗ trợ import danh sách sinh viên qua Google Sheets, lưu trữ tài liệu qua Google Drive và tự động gửi email thông báo qua Gmail API.
* **Phân quyền chặt chẽ (RBAC)**: Phân tách rõ ràng giao diện và nghiệp vụ cho 6 nhóm vai trò khác nhau.

---

## 🔑 Tài Khoản Kiểm Thử (Demo Accounts)

Tất cả tài khoản mẫu đã được khởi tạo sẵn với mật khẩu chung: **`Password@123`**  
Truy cập trang đăng nhập tại: **`http://localhost:3000/login`**

| Vai trò (Role) | Email đăng nhập | Mô tả nghiệp vụ | Dashboard |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin.cict@ctu.edu.vn` | Quản trị hệ thống, tài khoản, cơ cấu khoa/ngành & Audit Logs | `/admin/dashboard` |
| **FACULTY_ADMIN** | `qltt.cict@ctu.edu.vn` | Quản lý kỳ thực tập, thẩm định tin tuyển dụng, phân công GVHD | `/faculty/dashboard` |
| **LECTURER** | `gvhd.son@ctu.edu.vn` | Theo dõi tiến độ, duyệt nhật ký tuần, chấm điểm Rubric & CLO | `/lecturer/dashboard` |
| **STUDENT** | `b2110940@student.ctu.edu.vn` | Hồ sơ cá nhân, nộp đơn ứng tuyển, viết nhật ký & nộp báo cáo | `/student/dashboard` |
| **COMPANY_REP** | `tuyendung.fptct@fpt.com` | Đăng tin tuyển dụng, duyệt hồ sơ, phỏng vấn, phân công Mentor | `/company/dashboard` |
| **COMPANY_MENTOR** | `mentor.nam@fpt.com` | Hướng dẫn thực tế, đánh giá nhật ký tuần & chấm điểm cuối kỳ | `/mentor/dashboard` |

---

## 🏗️ Cấu Trúc Dự Án

```bash
InternLink/
├── backend-core/      # Backend API (Spring Boot 3, Java 21, JPA/Hibernate, Flyway)
├── frontend-web/      # Web App Portal (Next.js 14 App Router, Tailwind CSS, Zustand)
└── ai-service/        # AI Microservice (FastAPI, Python, Gemini/NLP Matching)
```

---

## ⚙️ Hướng Dẫn Khởi Chạy (Quick Start)

### 1. Backend Core (Spring Boot API — Port `8080`)
```bash
cd backend-core
mvn clean spring-boot:run
```
* **API Documentation (Swagger UI):** `http://localhost:8080/swagger-ui.html`

### 2. AI Service (Python FastAPI — Port `8000`)
```bash
cd ai-service
# Cài đặt dependencies (khuyến nghị dùng venv)
pip install -r requirements.txt

# Khởi chạy server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **AI Swagger Docs:** `http://localhost:8000/docs`

### 3. Frontend Web (Next.js App — Port `3000`)
```bash
cd frontend-web
npm install
npm run dev
```
* **Ứng dụng Web:** `http://localhost:3000`

---

## 🧪 Kiểm Thử (Testing)

* **Backend Unit & Integration Tests:**
  ```bash
  cd backend-core
  mvn test
  ```
* **Frontend Vitest Suite:**
  ```bash
  cd frontend-web
  npm run test
  ```

---

## 📄 Bản Quyền
Phát triển phục vụ Đề tài Luận văn Tốt nghiệp — **Trường Công nghệ Thông tin & Truyền thông, Đại học Cần Thơ (CICT - CTU)**.
