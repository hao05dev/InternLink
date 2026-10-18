-- ====================================================================
-- INTERNLINK MIGRATION V31:
-- 1. Support Assigned Lecturer inside student_rosters
-- 2. Support Program-scoped Report Templates (M-TT-04 KHMT, MMT, DEFAULT)
-- ====================================================================

-- 1. Student Rosters: Add lecturer assignment columns
ALTER TABLE student_rosters
ADD COLUMN IF NOT EXISTS assigned_lecturer_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS lecturer_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS lecturer_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS lecturer_email VARCHAR(150);

CREATE INDEX IF NOT EXISTS idx_student_rosters_assigned_lecturer ON student_rosters(assigned_lecturer_id);
CREATE INDEX IF NOT EXISTS idx_student_rosters_lecturer_email ON student_rosters(lecturer_email);

-- 2. Report Template Versions: Add program scope
ALTER TABLE report_template_versions
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES academic_programs(id),
ADD COLUMN IF NOT EXISTS program_code VARCHAR(30) NOT NULL DEFAULT 'DEFAULT';

CREATE INDEX IF NOT EXISTS idx_report_templates_program ON report_template_versions(term_id, report_type, program_code, is_active);

-- 3. Seed initial standard evaluation templates if term exists
DO $$
DECLARE
    v_term_id UUID := '55555555-5555-5555-5555-555555555555';
    v_dept_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_prog_cs UUID := '22222222-2222-2222-2222-222222222223';
    v_prog_ne UUID := '22222222-2222-2222-2222-222222222224';
BEGIN
    IF EXISTS (SELECT 1 FROM internship_terms WHERE id = v_term_id) THEN
        -- M-TT-04 Khoa học Máy tính
        INSERT INTO report_template_versions (
            id, term_id, department_id, program_id, program_code,
            title, description, report_type, file_url, file_name,
            file_size_bytes, mime_type, version_number, is_mandatory, is_active, created_by
        ) VALUES (
            '99999999-9999-9999-9999-999999999901',
            v_term_id, v_dept_id, v_prog_cs, 'CS',
            'Phiếu đánh giá dành cho GVHD (Khoa học Máy tính) - M-TT-04',
            'Mẫu phiếu đánh giá học phần Thực tập thực tế chuyên biệt cho ngành Khoa học Máy tính (áp dụng bảng điểm quá trình 6đ, chuyên môn 3đ, hình thức 1đ).',
            'M04', '/api/v1/storage/documents/sample/M-TT-04-Phieu_danh_gia_danh cho GVHD-2025-KHMT.doc',
            'M-TT-04-Phieu_danh_gia_danh cho GVHD-2025-KHMT.doc',
            65536, 'application/msword', 1, TRUE, TRUE, v_admin_id
        ) ON CONFLICT (id) DO NOTHING;

        -- M-TT-04 Mạng máy tính & Truyền thông dữ liệu
        INSERT INTO report_template_versions (
            id, term_id, department_id, program_id, program_code,
            title, description, report_type, file_url, file_name,
            file_size_bytes, mime_type, version_number, is_mandatory, is_active, created_by
        ) VALUES (
            '99999999-9999-9999-9999-999999999902',
            v_term_id, v_dept_id, v_prog_ne, 'NE',
            'Phiếu đánh giá dành cho GVHD (Mạng MT & TTDL) - M-TT-04',
            'Mẫu phiếu đánh giá học phần Thực tập thực tế chuyên biệt cho ngành Mạng máy tính và Truyền thông dữ liệu.',
            'M04', '/api/v1/storage/documents/sample/M-TT-04-Phieu_danh_gia_danh cho GVHD-2025_MMT.doc',
            'M-TT-04-Phieu_danh_gia_danh cho GVHD-2025_MMT.doc',
            65536, 'application/msword', 1, TRUE, TRUE, v_admin_id
        ) ON CONFLICT (id) DO NOTHING;

        -- M-TT-04 Mẫu chuẩn chung (KTPM, HTTT, CNTT, ATTT...)
        INSERT INTO report_template_versions (
            id, term_id, department_id, program_id, program_code,
            title, description, report_type, file_url, file_name,
            file_size_bytes, mime_type, version_number, is_mandatory, is_active, created_by
        ) VALUES (
            '99999999-9999-9999-9999-999999999903',
            v_term_id, v_dept_id, NULL, 'DEFAULT',
            'Phiếu đánh giá dành cho GVHD (Mẫu chuẩn chung) - M-TT-04',
            'Mẫu phiếu đánh giá chung áp dụng cho các ngành: Kỹ thuật phần mềm, Hệ thống thông tin, Công nghệ thông tin và các ngành khác.',
            'M04', '/api/v1/storage/documents/sample/M-TT-04-Phieu_danh_gia_danh cho GVHD-2025.doc',
            'M-TT-04-Phieu_danh_gia_danh cho GVHD-2025.doc',
            65536, 'application/msword', 1, TRUE, TRUE, v_admin_id
        ) ON CONFLICT (id) DO NOTHING;

        -- M-TT-05 Báo cáo thực tập chung
        INSERT INTO report_template_versions (
            id, term_id, department_id, program_id, program_code,
            title, description, report_type, file_url, file_name,
            file_size_bytes, mime_type, version_number, is_mandatory, is_active, created_by
        ) VALUES (
            '99999999-9999-9999-9999-999999999904',
            v_term_id, v_dept_id, NULL, 'ALL',
            'Mẫu Báo cáo Kết quả Thực tập - M-TT-05',
            'Mẫu báo cáo thực tập chung định dạng Word chuẩn cho sinh viên toàn khoa.',
            'M05', '/api/v1/storage/documents/sample/M-TT-05-Maubaocao.doc',
            'M-TT-05-Maubaocao.doc',
            81920, 'application/msword', 1, TRUE, TRUE, v_admin_id
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
