-- V37__seed_introduction_letter_requests.sql
-- Seed sample introduction letter requests for active term HK1 2026-2027

INSERT INTO introduction_letter_requests (
    id,
    student_id,
    term_id,
    target_company_name,
    target_position,
    reason,
    status,
    issued_code,
    issue_note,
    processed_by_user_id,
    processed_at,
    received_at,
    created_at,
    updated_at,
    version
) VALUES
-- 1. Nguyen Van Sinh Vien (B2001234) - PENDING
(
    'a1000000-0000-0000-0000-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '55555555-5555-5555-5555-555555555555',
    'VNPT Cần Thơ - Tập đoàn Bưu chính Viễn thông Việt Nam',
    'Thực tập sinh Quản trị Mạng & An toàn Thông tin',
    'Kính gửi Ban Quản lý Khoa xin cấp Giấy giới thiệu để liên hệ thực tập tự túc tại VNPT Cần Thơ',
    'PENDING',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    0
),
-- 2. Le Hoang Nam (B2110940) - APPROVED
(
    'a1000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000004',
    '55555555-5555-5555-5555-555555555555',
    'FPT Software Cần Thơ',
    'Kỹ sư phần mềm Java/Spring Boot',
    'Liên hệ thực tập học phần Thực tập doanh nghiệp HK1 (2026-2027)',
    'APPROVED',
    'GGT-2026-001',
    'Đã duyệt đơn và chuẩn bị sẵn bản in có mộc đỏ tại Văn phòng Khoa CNTT-TT',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW() - INTERVAL '1 day',
    NULL,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day',
    1
),
-- 3. Nguyen Van An (B2100001) - ISSUED
(
    'a1000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000021',
    '55555555-5555-5555-5555-555555555555',
    'Viettel Telecom Chi nhánh Cần Thơ',
    'Thực tập sinh Phát triển Ứng dụng Di động & Web',
    'Xin giấy giới thiệu liên hệ đơn vị thực tập doanh nghiệp viễn thông',
    'ISSUED',
    'GGT-2026-002',
    'Sinh viên đã xuất trình thẻ sinh viên và nhận giấy giới thiệu gốc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days',
    2
)
ON CONFLICT (id) DO NOTHING;
