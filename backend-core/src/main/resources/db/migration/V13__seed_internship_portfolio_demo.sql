-- ====================================================================
-- INTERNLINK MIGRATION V13: SEED DEMO DATA FOR INTERNSHIP RECORD & PORTFOLIO
-- ====================================================================

-- 1. Ensure 2nd Student Account for rich dropdown selection
INSERT INTO users (id, department_id, company_id, email, password_hash, full_name, phone_number, role, must_change_password, is_active)
VALUES 
    (
        '10000000-0000-0000-0000-000000000021',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'b2100001@student.ctu.edu.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Nguyễn Văn An (B2100001)',
        '0912345681',
        'STUDENT',
        FALSE,
        TRUE
    )
ON CONFLICT (email) DO NOTHING;

INSERT INTO student_rosters (id, term_id, program_id, student_code, official_email, full_name, academic_year, class_code, internship_course_code, eligibility_status, claimed_user_id, claimed_at)
VALUES (
    '20000000-0000-0000-0000-000000000021',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'B2100001',
    'b2100001@student.ctu.edu.vn',
    'Nguyễn Văn An',
    'Khóa 47',
    'DI2196A1',
    'CT250',
    'ELIGIBLE',
    '10000000-0000-0000-0000-000000000021',
    NOW()
)
ON CONFLICT (term_id, student_code) DO NOTHING;

-- 2. Ensure CV Documents for Applications
INSERT INTO documents (
    id, owner_user_id, context_type, context_id, document_type, storage_provider, original_name, mime_type, size_bytes, visibility, status
)
VALUES 
    (
        'd0000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
        'APPLICATION',
        'a0000000-0000-0000-0000-000000000001',
        'CV',
        'LOCAL',
        'CV_LeHoangNam_B2110940.pdf',
        'application/pdf',
        1048576,
        'PLACEMENT_PARTIES',
        'ACTIVE'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000021',
        'APPLICATION',
        'a0000000-0000-0000-0000-000000000002',
        'CV',
        'LOCAL',
        'CV_NguyenVanAn_B2100001.pdf',
        'application/pdf',
        1048576,
        'PLACEMENT_PARTIES',
        'ACTIVE'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Job Applications
INSERT INTO job_applications (
    id, job_id, student_id, submitted_cv_document_id, cover_letter, status, submitted_at
)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        '88888888-8888-8888-8888-888888888888',
        '10000000-0000-0000-0000-000000000004',
        'd0000000-0000-0000-0000-000000000001',
        'Em mong muốn được thực tập tại FPT Software Cần Thơ để nâng cao kỹ năng kiểm thử và phát triển phần mềm.',
        'OFFERED',
        NOW() - INTERVAL '30 days'
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        '99999999-9999-9999-9999-999999999999',
        '10000000-0000-0000-0000-000000000021',
        'd0000000-0000-0000-0000-000000000002',
        'Em có định hướng phát triển Frontend với React/Next.js và mong muốn được thực tập tại VNPT Cần Thơ.',
        'OFFERED',
        NOW() - INTERVAL '30 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Placement Offers
INSERT INTO placement_offers (
    id, application_id, proposed_mentor_id, start_date, end_date, stipend, expires_at, status, responded_at
)
VALUES 
    (
        'f0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000006',
        '2026-09-01',
        '2026-12-15',
        5500000.00,
        NOW() + INTERVAL '30 days',
        'ACCEPTED',
        NOW() - INTERVAL '25 days'
    ),
    (
        'f0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000006',
        '2026-09-01',
        '2026-12-15',
        5000000.00,
        NOW() + INTERVAL '30 days',
        'ACCEPTED',
        NOW() - INTERVAL '25 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Learning Agreements
INSERT INTO learning_agreements (
    id, offer_id, student_id, company_id, department_id, target_credits, learning_objectives, status
)
VALUES 
    (
        'e0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        4,
        'Nắm vững quy trình phát triển và kiểm thử tự động phần mềm quy mô lớn.',
        'APPROVED'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'f0000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000021',
        '44444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111',
        4,
        'Phát triển ứng dụng Web thực tế với React, TypeScript và Next.js.',
        'APPROVED'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Internship Placements
INSERT INTO internship_placements (
    id, agreement_id, student_id, company_id, mentor_id, lecturer_id, term_id, work_schedule, start_date, end_date, total_hours_worked, status
)
VALUES 
    (
        '66666666-6666-6666-6666-666666666666',
        'e0000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000004',
        '33333333-3333-3333-3333-333333333333',
        '10000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-000000000003',
        '55555555-5555-5555-5555-555555555555',
        '{"days": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], "hoursPerDay": 8}'::jsonb,
        '2026-09-01',
        '2026-12-15',
        88.00,
        'ACTIVE'
    ),
    (
        '66666666-6666-6666-6666-666666666667',
        'e0000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000021',
        '44444444-4444-4444-4444-444444444444',
        '10000000-0000-0000-0000-000000000006',
        '10000000-0000-0000-0000-000000000003',
        '55555555-5555-5555-5555-555555555555',
        '{"days": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], "hoursPerDay": 8}'::jsonb,
        '2026-09-01',
        '2026-12-15',
        72.00,
        'ACTIVE'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Daily Journals for Placement 1 (Lê Hoàng Nam)
INSERT INTO daily_journals (
    placement_id, work_date, attendance, start_time, end_time, break_minutes, sessions, hours,
    tasks, results, reflection, status, review_note, reviewed_by, reviewed_at
)
VALUES 
    (
        '66666666-6666-6666-6666-666666666666',
        '2026-09-01',
        'PRESENT',
        '08:00', '17:00', 60, 2, 8.00,
        'Gặp gỡ Mentor, nhận bàn giao máy tính và thiết lập môi trường phát triển (Java 21, Docker, PostgreSQL).',
        'Hoàn tất cấu hình môi trường và clone mã nguồn dự án thành công.',
        'Nắm được quy trình onboarding của công ty và sơ đồ kiến trúc hệ thống.',
        'CONFIRMED',
        'Tốt, đã setup nhanh và đúng chuẩn dự án.',
        '10000000-0000-0000-0000-000000000006',
        NOW() - INTERVAL '20 days'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        '2026-09-02',
        'PRESENT',
        '08:00', '17:00', 60, 2, 8.00,
        'Tìm hiểu tài liệu API Specification của module Quản lý ứng viên và viết test scenarios.',
        'Xác định được 12 ca kiểm thử chính (Happy case & Edge cases).',
        'Hiểu sâu hơn về validation nghiệp vụ tuyển dụng.',
        'CONFIRMED',
        'Kịch bản test đầy đủ, cần chú ý thêm trường hợp dữ liệu rỗng.',
        '10000000-0000-0000-0000-000000000006',
        NOW() - INTERVAL '19 days'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        '2026-09-03',
        'REMOTE',
        '08:00', '17:00', 60, 2, 8.00,
        'Viết mã kiểm thử tự động với Playwright và TypeScript cho luồng nộp hồ sơ ứng tuyển.',
        'Hoàn thành 5 test scripts tự động chạy qua CI Pipeline.',
        'Làm quen với việc debug luồng bất đồng bộ trên Playwright.',
        'CONFIRMED',
        'Code test sạch, tái sử dụng tốt các Page Object Model.',
        '10000000-0000-0000-0000-000000000006',
        NOW() - INTERVAL '18 days'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        '2026-09-04',
        'PRESENT',
        '08:00', '17:00', 60, 2, 8.00,
        'Tích hợp kiểm thử hiệu năng API tải danh sách ứng viên bằng k6.',
        'Đạt mốc 500 RPS với response time p95 < 250ms.',
        'Học được cách tối ưu hóa query JPA và thêm index cho bảng liên quan.',
        'CONFIRMED',
        'Kết quả test hiệu năng rất ấn tượng.',
        '10000000-0000-0000-0000-000000000006',
        NOW() - INTERVAL '17 days'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        '2026-09-05',
        'PRESENT',
        '08:00', '17:00', 60, 2, 8.00,
        'Tổng kết tuần 1: Trình bày kết quả demo kịch bản tự động hóa cho nhóm phát triển.',
        'Nhận được phản hồi tích cực từ Tech Lead và được giao thêm module Phỏng vấn.',
        'Rèn luyện kỹ năng thuyết trình và giao tiếp kỹ thuật.',
        'CONFIRMED',
        'Tuần đầu tiên làm việc rất năng động và có tinh thần tự học cao.',
        '10000000-0000-0000-0000-000000000006',
        NOW() - INTERVAL '16 days'
    )
ON CONFLICT (placement_id, work_date) DO NOTHING;

-- 8. Portfolio Forms (M01 - M05)
INSERT INTO portfolio_forms (
    placement_id, kind, template_version, content, status, published, published_at
)
VALUES 
    -- M01: Kế hoạch giao việc
    (
        '66666666-6666-6666-6666-666666666666',
        'M01',
        'CTU-2026-v1',
        '{
            "weeks": [
                {"week": 1, "tasks": "Onboarding, thiết lập môi trường Docker & tìm hiểu hệ thống", "comment": "Hoàn thành tốt", "sessions": 10, "hours": 40},
                {"week": 2, "tasks": "Xây dựng kịch bản kiểm thử tự động Playwright cho module ứng tuyển", "comment": "Đang thực hiện đúng tiến độ", "sessions": 10, "hours": 40},
                {"week": 3, "tasks": "Kiểm thử hiệu năng và tối ưu hóa truy vấn cơ sở dữ liệu", "comment": "Kế hoạch tuần tiếp theo", "sessions": 10, "hours": 40}
            ],
            "place": "FPT Software Cần Thơ",
            "comment": "Sinh viên có nền tảng tư duy lập trình và kiểm thử tốt, nắm bắt nhanh yêu cầu dự án."
        }'::jsonb,
        'APPROVED',
        TRUE,
        NOW() - INTERVAL '15 days'
    ),
    -- M02: Phiếu theo dõi tiến độ
    (
        '66666666-6666-6666-6666-666666666666',
        'M02',
        'CTU-2026-v1',
        '{
            "weeks": [
                {"week": 1, "tasks": "Tìm hiểu kiến trúc và viết 12 test cases", "comment": "Chuyên cần, đúng giờ", "sessions": 10, "hours": 40},
                {"week": 2, "tasks": "Automation test Playwright + k6 performance test", "comment": "Chủ động đề xuất giải pháp", "sessions": 10, "hours": 40}
            ]
        }'::jsonb,
        'APPROVED',
        TRUE,
        NOW() - INTERVAL '10 days'
    ),
    -- M03: Phiếu đánh giá của cơ quan thực tập
    (
        '66666666-6666-6666-6666-666666666666',
        'M03',
        'CTU-2026-v1',
        '{
            "scores": {
                "I.1. Thực hiện nội quy của cơ quan": 10,
                "I.2. Chấp hành giờ giấc làm việc": 10,
                "I.3. Thái độ giao tiếp với cán bộ trong đơn vị": 9.5,
                "I.4. Tích cực trong công việc": 10,
                "II.1. Đáp ứng yêu cầu công việc": 9.5,
                "II.2. Tinh thần học hỏi, nâng cao chuyên môn": 10,
                "II.3. Có đề xuất, sáng kiến, năng động trong công việc": 9.0,
                "III.1. Báo cáo tiến độ mỗi tuần một lần": 10,
                "III.2. Hoàn thành công việc được giao": 9.5,
                "III.3. Kết quả có đóng góp cho cơ quan": 9.5
            },
            "comment": "Sinh viên Lê Hoàng Nam thể hiện tinh thần trách nhiệm cao, hòa nhập nhanh với văn hóa doanh nghiệp và hoàn thành xuất sắc các nhiệm vụ kiểm thử tự động được giao.",
            "suggestions": "Tiếp tục phát huy thế mạnh về công nghệ mới và kỹ năng giải quyết vấn đề độc lập.",
            "trainingFeedback": ["Phù hợp với thực tế", "Tăng cường kỹ năng làm việc nhóm"]
        }'::jsonb,
        'APPROVED',
        TRUE,
        NOW() - INTERVAL '5 days'
    ),
    -- M04: Giảng viên chấm báo cáo
    (
        '66666666-6666-6666-6666-666666666666',
        'M04',
        'CTU-2026-v1',
        '{
            "academicScores": {
                "REPORT": {"score": 9.0},
                "PRESENTATION": {"score": 9.2}
            },
            "comment": "Báo cáo trình bày rõ ràng, đúng quy chuẩn học thuật, nội dung thực tập gắn liền với chuyên ngành đào tạo.",
            "academicTotals": {"TOTAL": 9.1}
        }'::jsonb,
        'APPROVED',
        TRUE,
        NOW() - INTERVAL '2 days'
    ),
    -- M05: Báo cáo thực tập cuối kỳ
    (
        '66666666-6666-6666-6666-666666666666',
        'M05',
        'CTU-2026-v1',
        '{
            "sections": {
                "thanks": "Em xin chân thành cảm ơn các thầy cô Khoa CNTT&TT - ĐH Cần Thơ cùng ban lãnh đạo và các anh chị tại FPT Software Cần Thơ đã tận tình hướng dẫn và tạo điều kiện cho em hoàn thành kỳ thực tập.",
                "organization": "FPT Software Cần Thơ là chi nhánh trực thuộc FPT Software, chuyên cung cấp các giải pháp chuyển đổi số và phát triển phần mềm chất lượng cao cho thị trường trong và ngoài nước.",
                "work": "Tham gia vào dự án với vai trò Automation Test Engineer: Thiết kế kịch bản kiểm thử tự động, tích hợp CI/CD Pipeline và đo lường hiệu năng hệ thống.",
                "method": "Áp dụng phương pháp luận Agile/Scrum, kiểm thử hướng hành vi (BDD) và công cụ Playwright kết hợp k6.",
                "outcomes": "Tự động hóa thành công 85% các ca kiểm thử hồi quy, giúp rút ngắn 40% thời gian kiểm thử trước mỗi đợt release sản phẩm."
            }
        }'::jsonb,
        'APPROVED',
        TRUE,
        NOW() - INTERVAL '1 days'
    )
ON CONFLICT (placement_id, kind) DO NOTHING;
