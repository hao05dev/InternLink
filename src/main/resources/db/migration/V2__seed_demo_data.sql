-- ====================================================================
-- CTU INTERNLINK SEED DATA - 6 ACTORS, SAMPLE TERM, ESCO SKILLS
-- Password for all demo accounts: "Password@123"
-- BCrypt Hash: $2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6
-- ====================================================================

-- 1. Departments (Khoa CNTT-TT)
INSERT INTO departments (id, code, name, contact_email, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'CICT', 'Trường Công nghệ Thông tin và Truyền thông - ĐH Cần Thơ', 'cict@ctu.edu.vn', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 2. Academic Programs (Kỹ thuật phần mềm)
INSERT INTO academic_programs (id, department_id, code, name, degree_level, is_active)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'SE', 'Kỹ thuật phần mềm', 'UNDERGRADUATE', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3. Companies (FPT Software Cần Thơ)
INSERT INTO companies (id, company_name, tax_code, industry, website, address, verification_status, verification_detail)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'FPT Software Cần Thơ',
    '0101234567',
    'Công nghệ thông tin & Phần mềm',
    'https://fptsoftware.com',
    '{"street": "Đường số 1, KDC Nam Long", "ward": "Hưng Thạnh", "district": "Cái Răng", "province": "Cần Thơ"}'::jsonb,
    'VERIFIED',
    '{"safetyCheckPassed": true, "legalChecked": true}'::jsonb
)
ON CONFLICT (tax_code) DO NOTHING;

-- 4. Users (6 Demo Accounts for 6 Actors)
-- Password: Password@123
INSERT INTO users (id, department_id, company_id, email, password_hash, full_name, phone_number, role, must_change_password, is_active)
VALUES 
    -- 1. Admin
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NULL, 'admin@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Quản trị viên Hệ thống', '0901000001', 'ADMIN', FALSE, TRUE),
    -- 2. Faculty Admin
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NULL, 'faculty@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Cán bộ Quản lý Thực tập', '0901000002', 'FACULTY_ADMIN', FALSE, TRUE),
    -- 3. Lecturer (GVHD)
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', NULL, 'lecturer@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'TS. Nguyễn Văn Hướng Dẫn', '0901000003', 'LECTURER', FALSE, TRUE),
    -- 4. Student
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', NULL, 'student@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Nguyễn Văn Sinh Viên', '0901000004', 'STUDENT', FALSE, TRUE),
    -- 5. Company Representative
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '33333333-3333-3333-3333-333333333333', 'recruiter@fpt.com', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Trần Thị Tuyển Dụng', '0901000005', 'COMPANY_REP', FALSE, TRUE),
    -- 6. Company Mentor
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, '33333333-3333-3333-3333-333333333333', 'mentor@fpt.com', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Lê Văn Mentor', '0901000006', 'COMPANY_MENTOR', FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Update verified_by_user_id for sample company
UPDATE companies SET verified_by_user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', verified_at = NOW() WHERE id = '33333333-3333-3333-3333-333333333333';

-- 5. Internship Term (HK1 2026-2027)
INSERT INTO internship_terms (id, department_id, code, term_name, academic_year, semester, registration_open_at, registration_close_at, start_date, end_date, application_deadline, evaluation_deadline, status, settings)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'HK1_2026_2027',
    'Học kỳ 1 Năm học 2026-2027',
    '2026-2027',
    'HK1',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '105 days',
    NOW() + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '115 days',
    'APPLICATION_OPEN',
    '{"requiredHours": 320, "weeklyLogFrequency": "WEEKLY", "appealWindowDays": 7, "mentorWeight": 0.6, "lecturerWeight": 0.4}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- 6. Student Rosters (Roster SV Đủ điều kiện)
INSERT INTO student_rosters (id, term_id, program_id, student_code, official_email, full_name, academic_year, eligibility_status, claimed_user_id, claimed_at)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'B2001234',
    'student@ctu.edu.vn',
    'Nguyễn Văn Sinh Viên',
    'Khóa 46',
    'ELIGIBLE',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW()
)
ON CONFLICT (term_id, student_code) DO NOTHING;

-- 7. Student Profiles
INSERT INTO student_profiles (user_id, program_id, student_code, gpa, bio, preferences, certificates, passed_courses)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'B2001234',
    3.45,
    'Sinh viên năm 4 chuyên ngành Kỹ thuật phần mềm. Yêu thích lập trình Backend, RESTful API và Cloud Native.',
    '{"locations": ["Cần Thơ", "TP. Hồ Chí Minh"], "workFormats": ["ONSITE", "HYBRID"]}'::jsonb,
    '[{"name": "AWS Certified Cloud Practitioner", "year": 2025}]'::jsonb,
    '[{"courseCode": "CT176", "courseName": "Lập trình hướng đối tượng", "grade": 3.7}, {"courseCode": "CT240", "courseName": "Cơ sở dữ liệu", "grade": 3.5}]'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- 8. Skill Taxonomies (Từ điển kỹ năng chuẩn ESCO / NACE)
INSERT INTO skill_taxonomies (id, skill_name, category, framework, aliases, taxonomy_version, description)
VALUES 
    -- Technical - Backend & Languages
    ('SK-JAVA', 'Java', 'TECHNICAL', 'ESCO', '["Java 17", "Java 21", "Core Java"]'::jsonb, 'v1.0', 'Ngôn ngữ lập trình Java hướng đối tượng'),
    ('SK-SPRING-BOOT', 'Spring Boot', 'TECHNICAL', 'ESCO', '["Spring Boot 3", "Spring Framework", "Spring Data", "Spring Security"]'::jsonb, 'v1.0', 'Framework phát triển backend Java'),
    ('SK-PYTHON', 'Python', 'TECHNICAL', 'ESCO', '["Python 3", "Pythonic"]'::jsonb, 'v1.0', 'Ngôn ngữ lập trình Python'),
    ('SK-FASTAPI', 'FastAPI', 'TECHNICAL', 'ESCO', '["FastAPI Python", "Starlette"]'::jsonb, 'v1.0', 'Web framework Python hiệu năng cao'),
    ('SK-POSTGRESQL', 'PostgreSQL', 'TECHNICAL', 'ESCO', '["Postgres", "pgvector", "Relational Database"]'::jsonb, 'v1.0', 'Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở'),
    ('SK-DOCKER', 'Docker', 'TECHNICAL', 'ESCO', '["Container", "Docker Compose"]'::jsonb, 'v1.0', 'Công nghệ đóng gói container ứng dụng'),
    ('SK-REST-API', 'RESTful API', 'TECHNICAL', 'ESCO', '["REST API", "JSON API", "Web Services"]'::jsonb, 'v1.0', 'Thiết kế và xây dựng API theo kiến trúc REST'),
    ('SK-REACT', 'React', 'TECHNICAL', 'ESCO', '["React.js", "Next.js", "React Hooks"]'::jsonb, 'v1.0', 'Thư viện JavaScript xây dựng giao diện người dùng'),
    ('SK-GIT', 'Git', 'TECHNICAL', 'ESCO', '["Git Version Control", "GitHub", "GitLab"]'::jsonb, 'v1.0', 'Hệ thống quản lý phiên bản mã nguồn phân tán'),
    -- Soft Skills (NACE Competencies)
    ('SK-CRITICAL-THINKING', 'Critical Thinking', 'SOFT_SKILL', 'NACE', '["Tư duy phản biện", "Giải quyết vấn đề", "Problem Solving"]'::jsonb, 'v1.0', 'Khả năng phân tích, đánh giá vấn đề logic'),
    ('SK-COMMUNICATION', 'Communication', 'SOFT_SKILL', 'NACE', '["Giao tiếp", "Trình bày", "Team Communication"]'::jsonb, 'v1.0', 'Khả năng truyền đạt thông tin rõ ràng, hiệu quả'),
    ('SK-TEAMWORK', 'Teamwork', 'SOFT_SKILL', 'NACE', '["Làm việc nhóm", "Collaboration", "Hợp tác"]'::jsonb, 'v1.0', 'Khả năng phối hợp nhịp nhàng trong tập thể'),
    ('SK-PROFESSIONALISM', 'Professionalism & Work Ethic', 'SOFT_SKILL', 'NACE', '["Đạo đức nghề nghiệp", "Trách nhiệm", "Kỷ luật"]'::jsonb, 'v1.0', 'Tác phong chuyên nghiệp, đúng giờ, tuân thủ kỷ luật')
ON CONFLICT (id) DO NOTHING;

-- 9. Student Skills Sample
INSERT INTO student_skills (student_id, skill_id, source, proficiency_level, confidence, is_confirmed)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-JAVA', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.90, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-SPRING-BOOT', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.85, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-POSTGRESQL', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.80, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-GIT', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.95, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-TEAMWORK', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.90, TRUE)
ON CONFLICT (student_id, skill_id) DO NOTHING;

-- 10. Sample Approved Job Position
INSERT INTO job_positions (
    id, company_id, term_id, department_id, title, work_format, location, vacancies, description,
    target_program_codes, target_learning_outcomes, benefits, stipend_amount, status, approved_by_user_id, approved_at
)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Thực tập sinh Java Backend Developer',
    'HYBRID',
    'Tòa nhà FPT Cần Thơ, Đường số 1, KDC Nam Long, Cái Răng, Cần Thơ',
    3,
    'Tham gia phát triển các module dịch vụ backend trên nền tảng Java 21, Spring Boot 3 và PostgreSQL. Viết REST API, Unit Test và phối hợp làm việc theo mô hình Agile/Scrum.',
    '["SE", "CS", "IT"]'::jsonb,
    '["Nắm vững kiến trúc Microservices & Spring Boot", "Kỹ năng làm việc nhóm và giao tiếp dự án"]'::jsonb,
    '["Hỗ trợ phụ cấp hàng tháng", "Cơ hội trở thành nhân viên chính thức sau thực tập", "Được cấp laptop làm việc"]'::jsonb,
    5000000.00,
    'APPROVED',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 11. Job Skills for Sample Position
INSERT INTO job_skills (job_id, skill_id, requirement_type, required_level, weight)
VALUES
    ('77777777-7777-7777-7777-777777777777', 'SK-JAVA', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('77777777-7777-7777-7777-777777777777', 'SK-SPRING-BOOT', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('77777777-7777-7777-7777-777777777777', 'SK-POSTGRESQL', 'OPTIONAL', 'BEGINNER', 0.8),
    ('77777777-7777-7777-7777-777777777777', 'SK-GIT', 'MANDATORY', 'INTERMEDIATE', 0.7),
    ('77777777-7777-7777-7777-777777777777', 'SK-TEAMWORK', 'MANDATORY', 'INTERMEDIATE', 0.6)
ON CONFLICT (job_id, skill_id) DO NOTHING;
