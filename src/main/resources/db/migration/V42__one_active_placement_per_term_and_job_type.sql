-- V42__one_active_placement_per_term_and_job_type.sql
-- Thêm phân loại tuyển dụng (INTERNSHIP/FRESHER) và ràng buộc duy nhất 1 placement active mỗi kỳ cho mỗi sinh viên

-- 1. Thêm cột job_type vào bảng job_positions
ALTER TABLE job_positions ADD COLUMN job_type VARCHAR(20) NOT NULL DEFAULT 'INTERNSHIP';
ALTER TABLE job_positions ADD CONSTRAINT chk_job_positions_job_type CHECK (job_type IN ('INTERNSHIP', 'FRESHER'));

-- 2. Backfill dữ liệu cũ dựa vào từ khóa
UPDATE job_positions
SET job_type = 'FRESHER'
WHERE LOWER(title) LIKE '%fresher%'
   OR LOWER(title) LIKE '%full-time%'
   OR LOWER(title) LIKE '%fulltime%'
   OR LOWER(title) LIKE '%chính thức%'
   OR LOWER(COALESCE(description, '')) LIKE '%tốt nghiệp%'
   OR LOWER(COALESCE(description, '')) LIKE '%ra trường%';

-- 3. Cho phép term_id nullable đối với FRESHER (INTERNSHIP bắt buộc phải có kỳ)
ALTER TABLE job_positions ALTER COLUMN term_id DROP NOT NULL;
ALTER TABLE job_positions ADD CONSTRAINT chk_job_positions_term_by_type
    CHECK ((job_type = 'INTERNSHIP' AND term_id IS NOT NULL) OR (job_type = 'FRESHER'));

-- 4. Ràng buộc cấp cơ sở dữ liệu: Mỗi sinh viên chỉ có tối đa 1 placement đang hoạt động trong mỗi kỳ
CREATE UNIQUE INDEX IF NOT EXISTS uq_placement_student_term_live
    ON internship_placements (student_id, term_id)
    WHERE status NOT IN ('TERMINATED', 'TRANSFERRED');
