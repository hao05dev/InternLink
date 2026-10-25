-- V35: Expand report template types to support official 8-week / 12-week forms and seed genuine templates

ALTER TABLE report_template_versions DROP CONSTRAINT IF EXISTS report_template_versions_report_type_check;

ALTER TABLE report_template_versions ADD CONSTRAINT report_template_versions_report_type_check
CHECK (report_type IN (
  'FORM_04_RECEPTION_8W', 'FORM_04_RECEPTION_12W',
  'M01', 'M02', 'M03', 'M04',
  'M04_LECTURER_KHMT', 'M04_LECTURER_MMT', 'M04_LECTURER_COMMON',
  'M05', 'M05_REPORT_GUIDELINE',
  'WEEKLY_REPORT', 'FINAL_REPORT', 'OTHER'
));

-- Seed all remaining official template files for the active term 2026-2027 HK1
INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999905'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Biểu mẫu 04: Phiếu tiếp nhận SV thực tập (8 tuần)',
    'Doanh nghiệp tiếp nhận ký và đóng dấu xác nhận tiếp nhận sinh viên thực tập (đợt 8 tuần)',
    'FORM_04_RECEPTION_8W',
    'DEFAULT',
    '/api/v1/storage/documents/official/04-Phieu_nhan_SV.doc',
    '04-Phieu_nhan_SV.doc',
    37888,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;

INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999906'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Biểu mẫu 04: Phiếu tiếp nhận SV thực tập (12 tuần - TTDN)',
    'Doanh nghiệp tiếp nhận ký và đóng dấu xác nhận tiếp nhận sinh viên thực tập chuyên sâu (đợt 12 tuần)',
    'FORM_04_RECEPTION_12W',
    'DEFAULT',
    '/api/v1/storage/documents/official/04-Phieu_nhan_SV_12tuan.doc',
    '04-Phieu_nhan_SV_12tuan.doc',
    37888,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;

INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999907'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'M-TT-01: Phiếu kế hoạch giao việc thực tập doanh nghiệp',
    'Người hướng dẫn tại đơn vị thực tập phân công nội dung và lộ trình công việc cho sinh viên',
    'M01',
    'DEFAULT',
    '/api/v1/storage/documents/official/M-TT-01-Phieugiaoviec.doc',
    'M-TT-01-Phieugiaoviec.doc',
    38912,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;

INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999908'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'M-TT-01-1: Phiếu kế hoạch giao việc thực tập (12 tuần)',
    'Phân công công việc chuyên sâu dành cho chương trình thực tập doanh nghiệp 12 tuần',
    'M01',
    'DEFAULT',
    '/api/v1/storage/documents/official/M-TT-01-1-Phieugiaoviec_TTDN_12tuan.doc',
    'M-TT-01-1-Phieugiaoviec_TTDN_12tuan.doc',
    41472,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;

INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999909'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'M-TT-02: Phiếu theo dõi tiến độ thực tập',
    'Cán bộ hướng dẫn ghi nhận và xác nhận quá trình làm việc định kỳ của sinh viên',
    'M02',
    'DEFAULT',
    '/api/v1/storage/documents/official/M-TT-02-Phieutheodoi.doc',
    'M-TT-02-Phieutheodoi.doc',
    38912,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;

INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999910'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'M-TT-02-1: Phiếu theo dõi tiến độ thực tập (12 tuần)',
    'Theo dõi tiến độ thực tập chuyên sâu 12 tuần',
    'M02',
    'DEFAULT',
    '/api/v1/storage/documents/official/M-TT-02-1-Phieutheodoi_TTDN_12Tuan.doc',
    'M-TT-02-1-Phieutheodoi_TTDN_12Tuan.doc',
    41984,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;

INSERT INTO report_template_versions (
    id, term_id, title, description, report_type, program_code,
    file_url, file_name, file_size_bytes, mime_type, version_number,
    is_mandatory, is_active, created_by
)
SELECT
    '99999999-9999-9999-9999-999999999911'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'M-TT-03: Phiếu đánh giá của cơ quan/doanh nghiệp tiếp nhận',
    'Cơ quan tiếp nhận đánh giá kết quả, thái độ, tính kỷ luật và năng lực chuyên môn của sinh viên',
    'M03',
    'DEFAULT',
    '/api/v1/storage/documents/official/M-TT-03-pdgia_coquan.doc',
    'M-TT-03-pdgia_coquan.doc',
    38400,
    'application/msword',
    1, true, true,
    u.id
FROM users u WHERE u.email = 'qltt.cict@ctu.edu.vn'
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_size_bytes = EXCLUDED.file_size_bytes;
