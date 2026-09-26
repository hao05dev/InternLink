-- V5: Thêm cột created_by_user_id vào bảng job_positions
-- Mục đích: Cho phép hệ thống track COMPANY_REP nào tạo vị trí thực tập,
--           dùng để kiểm tra quyền ký thỏa thuận học tập 3 bên (Anti-IDOR P1).

ALTER TABLE job_positions
    ADD COLUMN IF NOT EXISTS created_by_user_id UUID
        REFERENCES users(id) ON DELETE SET NULL;

-- Ghi chú: Các bản ghi hiện có sẽ có created_by_user_id = NULL (nullable)
-- vì không thể suy luận retroactively ai đã tạo.
-- Kể từ migration này, mọi vị trí mới đều phải được gắn created_by_user_id.
