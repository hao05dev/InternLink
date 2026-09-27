-- ====================================================================
-- INTERNLINK MIGRATION V8: SEED REAL PORTAL ACCOUNTS ACROSS 6 ROLES
-- Standard password for all seeded accounts: "Password@123"
-- BCrypt Hash: $2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6
-- ====================================================================

-- 1. Ensure Partner Companies
INSERT INTO companies (id, company_name, tax_code, industry, website, address, verification_status, verification_detail)
VALUES 
    (
        '44444444-4444-4444-4444-444444444444',
        'VNPT Cần Thơ - Trung tâm Công nghệ Thông tin',
        '1800109999',
        'Viễn thông & Dịch vụ Số',
        'https://vnptcantho.vn',
        '{"street": "Số 02 Nguyễn Trãi", "ward": "Tân An", "district": "Ninh Kiều", "province": "Cần Thơ"}'::jsonb,
        'VERIFIED',
        '{"partnerType": "STRATEGIC_MOU", "safetyCheckPassed": true, "legalChecked": true}'::jsonb
    ),
    (
        'a1b2c3d4-0000-0000-0000-111122223333',
        'LG CNS Việt Nam',
        '0312999888',
        'Công nghệ thông tin & Giải pháp Doanh nghiệp',
        'https://lgcns.com',
        '{"street": "Tầng 15, Tòa nhà Bitexco", "ward": "Bến Nghé", "district": "Quận 1", "province": "TP. Hồ Chí Minh"}'::jsonb,
        'VERIFIED',
        '{"partnerType": "GLOBAL_ENTERPRISE", "safetyCheckPassed": true, "legalChecked": true}'::jsonb
    )
ON CONFLICT (tax_code) DO NOTHING;

-- 2. Seed Real Users for 6 Actors
INSERT INTO users (id, department_id, company_id, email, password_hash, full_name, phone_number, role, must_change_password, is_active)
VALUES 
    -- 1. ADMIN - Quản trị viên Cổng thông tin Trường ĐH Cần Thơ
    (
        '10000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'admin.cict@ctu.edu.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Quản trị viên Hệ thống CICT - CTU',
        '0912345670',
        'ADMIN',
        FALSE,
        TRUE
    ),
    -- 2. FACULTY_ADMIN - Ban Quản lý Thực tập Khoa / Trường CNTT&TT
    (
        '10000000-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'qltt.cict@ctu.edu.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Ban Quản lý Thực tập CICT - ĐH Cần Thơ',
        '0912345671',
        'FACULTY_ADMIN',
        FALSE,
        TRUE
    ),
    -- 3. LECTURER - Giảng viên hướng dẫn học phần Thực tập doanh nghiệp
    (
        '10000000-0000-0000-0000-000000000003',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'gvhd.son@ctu.edu.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'ThS. Nguyễn Thái Sơn (GVHD CICT)',
        '0912345672',
        'LECTURER',
        FALSE,
        TRUE
    ),
    -- 4. STUDENT - Sinh viên đủ điều kiện thực tập tốt nghiệp
    (
        '10000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'b2110940@student.ctu.edu.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Lê Hoàng Nam (B2110940)',
        '0912345673',
        'STUDENT',
        FALSE,
        TRUE
    ),
    -- 5. COMPANY_REP - Đại diện Tuyển dụng Doanh nghiệp (FPT Software Cần Thơ)
    (
        '10000000-0000-0000-0000-000000000005',
        NULL,
        '33333333-3333-3333-3333-333333333333',
        'tuyendung.fptct@fpt.com',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Lê Nguyễn Kim Ngân (HR FPT Software Cần Thơ)',
        '0912345674',
        'COMPANY_REP',
        FALSE,
        TRUE
    ),
    -- 6. COMPANY_MENTOR - Cán bộ Kỹ thuật Hướng dẫn tại Doanh nghiệp
    (
        '10000000-0000-0000-0000-000000000006',
        NULL,
        '33333333-3333-3333-3333-333333333333',
        'mentor.nam@fpt.com',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Phạm Nhật Nam (Tech Lead & Mentor FPT)',
        '0912345675',
        'COMPANY_MENTOR',
        FALSE,
        TRUE
    )
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = TRUE;

-- 3. Roster & Student Profile for Real Student b2110940
INSERT INTO student_rosters (id, term_id, program_id, student_code, official_email, full_name, academic_year, eligibility_status, claimed_user_id, claimed_at)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'B2110940',
    'b2110940@student.ctu.edu.vn',
    'Lê Hoàng Nam',
    'Khóa 47',
    'ELIGIBLE',
    '10000000-0000-0000-0000-000000000004',
    NOW()
)
ON CONFLICT (term_id, student_code) DO NOTHING;

INSERT INTO student_profiles (user_id, program_id, student_code, gpa, bio, preferences, certificates, passed_courses)
VALUES (
    '10000000-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222222',
    'B2110940',
    3.62,
    'Sinh viên Kỹ thuật phần mềm Khóa 47 - Trường CNTT&TT - ĐH Cần Thơ. Đã tích lũy đủ số tín chỉ thực tập doanh nghiệp. Định hướng Fullstack & Cloud.',
    '{"locations": ["Cần Thơ", "TP. Hồ Chí Minh"], "workFormats": ["ONSITE", "HYBRID"]}'::jsonb,
    '[{"name": "TOEIC 750", "year": 2025}, {"name": "Oracle Certified Java Associate", "year": 2025}]'::jsonb,
    '[{"courseCode": "CT176", "courseName": "Lập trình hướng đối tượng", "grade": 3.8}, {"courseCode": "CT240", "courseName": "Cơ sở dữ liệu", "grade": 4.0}, {"courseCode": "CT300", "courseName": "Phát triển phần mềm chuyên nghiệp", "grade": 3.6}]'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Seed additional realistic Job Positions (matching modern portal structure)
INSERT INTO job_positions (
    id, company_id, term_id, department_id, title, work_format, location, vacancies, description,
    target_program_codes, target_learning_outcomes, benefits, stipend_amount, status, approved_by_user_id, approved_at
)
VALUES 
    (
        '88888888-8888-8888-8888-888888888888',
        '33333333-3333-3333-3333-333333333333',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Automation Test Engineer',
        'ONSITE',
        'Tòa nhà FPT Cần Thơ, Đường số 1, KDC Nam Long, Cái Răng, Cần Thơ',
        2,
        'Tham gia viết kịch bản kiểm thử tự động (Automation Test Script) với Selenium / Playwright và Java/TypeScript. Phối hợp với đội ngũ phát triển theo quy trình CI/CD và Agile.',
        '["SE", "IT"]'::jsonb,
        '["Hiểu rõ chu trình kiểm thử phần mềm thực tế", "Kỹ năng tự động hóa kiểm thử và báo cáo lỗi chính xác"]'::jsonb,
        '["Phụ cấp thực tập: 4.500.000 VNĐ - 6.000.000 VNĐ / tháng", "Có Mentor 1:1 hướng dẫn chuyên môn", "Hỗ trợ dấu mộc và xác nhận bảng điểm thực tập chính thức"]'::jsonb,
        5500000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW()
    ),
    (
        '99999999-9999-9999-9999-999999999999',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Phát triển Ứng dụng Web (React & TypeScript)',
        'HYBRID',
        'Trung tâm CNTT VNPT Cần Thơ, Số 02 Nguyễn Trãi, Ninh Kiều, Cần Thơ',
        4,
        'Tham gia xây dựng giao diện ứng dụng quản trị số cho các cơ quan hành chính công và doanh nghiệp. Sử dụng React, Next.js, Tailwind CSS và kết nối REST API.',
        '["SE", "IT", "CS"]'::jsonb,
        '["Làm chủ kỹ năng lập trình giao diện React/Next.js chuẩn doanh nghiệp", "Kỹ năng làm việc nhóm và bảo mật giao diện"]'::jsonb,
        '["Hỗ trợ chi phí đi lại và phụ cấp theo kết quả công việc", "Môi trường công nghệ hiện đại, kết nối thực tế doanh nghiệp số"]'::jsonb,
        5000000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Link Skills to New Positions
INSERT INTO job_skills (job_id, skill_id, requirement_type, required_level, weight)
VALUES
    ('88888888-8888-8888-8888-888888888888', 'SK-JAVA', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('88888888-8888-8888-8888-888888888888', 'SK-GIT', 'MANDATORY', 'BEGINNER', 0.8),
    ('88888888-8888-8888-8888-888888888888', 'SK-CRITICAL-THINKING', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('99999999-9999-9999-9999-999999999999', 'SK-REACT', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('99999999-9999-9999-9999-999999999999', 'SK-REST-API', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('99999999-9999-9999-9999-999999999999', 'SK-GIT', 'MANDATORY', 'BEGINNER', 0.7)
ON CONFLICT (job_id, skill_id) DO NOTHING;
