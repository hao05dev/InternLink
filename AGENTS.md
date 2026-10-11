# Coding Rules & Guidelines for InternLink

This document defines mandatory guidelines for all AI agents and developers working on the InternLink codebase.

---

## 1. Single Responsibility Principle (SRP) - Nguyên Tắc Đơn Nhiệm

- **Mỗi file chỉ đảm nhận duy nhất một nhiệm vụ (Single Responsibility):**
  - Component điều phối (`*view.tsx`, `*page.tsx`) chỉ quản lý bố cục và phân phối state, **không** nhồi nhét trực tiếp logic Form Modal, thanh lọc đồ sộ, hay chi tiết giao diện của từng hàng/thẻ.
  - Các phần tử giao diện độc lập sau **BẮT BUỘC phải được tách thành file riêng**:
    - **Modal / Form Dialog**: Đặt trong thư mục `modals/` (ví dụ: `candidate-interview-modal.tsx`).
    - **Filter Bar / Bộ lọc**: Đặt trong thư mục component chuyên biệt (ví dụ: `company-candidate-filter-bar.tsx`).
    - **Metrics / Thống kê**: Đặt trong component riêng (ví dụ: `company-intern-metrics.tsx`).
    - **Cards / Row Items**: Đặt trong thư mục `cards/` (ví dụ: `candidate-table-row-card.tsx`).
  - Logic tính toán phức tạp hoặc state API dài phải được đóng gói vào **Custom Hook** hoặc **Service**.

---

## 2. File Length Guidelines - Giới Hạn Độ Dài File

- **Mục tiêu lý tưởng**: Dưới **150 – 200 dòng** mỗi file.
- **Ngưỡng cảnh báo**: Từ **250 dòng** trở lên, phải chủ động cân nhắc bóc tách.
- **Giới hạn tối đa**: **TUYỆT ĐỐI KHÔNG để file vượt quá 350 dòng**.
- **Quy tắc bắt buộc**: Khi thêm tính năng mới hoặc chỉnh sửa code, nếu phát hiện file đang phình to hoặc vượt quá giới hạn trên, Agent **BẮT BUỘC phải chủ động refactor tách nhỏ file** trước khi bàn giao cho người dùng.

---

## 3. UI/UX Consistency & Best Practices

- Luôn thiết kế bộ lọc theo cấp bậc hợp lý (ví dụ: **Niên khóa** $\rightarrow$ **Học kỳ** $\rightarrow$ **Vị trí** $\rightarrow$ **Trạng thái**).
- Đồng bộ bộ lọc cho tất cả chế độ hiển thị (ví dụ: cả Kanban Pipeline và Table View).
- Luôn có trạng thái Empty State thân thiện khi bộ lọc không có kết quả và cung cấp nút **"Đặt lại bộ lọc"**.
- Mọi component bóc tách mới phải có TypeScript types rõ ràng và đi kèm Unit Test khi áp dụng logic quan trọng.
