-- ====================================================================
-- INTERNLINK MIGRATION V30: SEED ASSESSMENT SCHEMES AND ACADEMIC PROGRAMS
-- Supports M-TT-04 KHMT, M-TT-04 MMT, and Common Evaluation Schemes
-- ====================================================================

-- 1. Ensure Academic Programs for CS (Khoa học Máy tính) and NE (Mạng máy tính & Truyền thông)
INSERT INTO academic_programs (id, department_id, code, name, degree_level, track, is_active)
VALUES 
    (
        '22222222-2222-2222-2222-222222222223',
        '11111111-1111-1111-1111-111111111111',
        'CS',
        'Khoa học Máy tính',
        'UNDERGRADUATE',
        'REGULAR',
        TRUE
    ),
    (
        '22222222-2222-2222-2222-222222222224',
        '11111111-1111-1111-1111-111111111111',
        'NE',
        'Mạng máy tính và Truyền thông dữ liệu',
        'UNDERGRADUATE',
        'REGULAR',
        TRUE
    )
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Assessment Schemes for Term HK1_2026_2027

-- Scheme A: Khoa học Máy tính (KHMT) - 6.0 Theo dõi quá trình, 3.0 Báo cáo, 1.0 Hình thức
INSERT INTO assessment_schemes (
    id, term_id, program_id, cohort_code, course_code, revision,
    source_reference, components, required_logbook_weeks, weekly_grace_days,
    require_midterm_report, require_final_report, status, approved_at, version
)
VALUES (
    '88888888-8888-8888-8888-888888888801',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222223',
    'K47',
    'CT250',
    1,
    'M-TT-04-KHMT: Đánh giá quá trình (6đ), Báo cáo chuyên môn (3đ), Hình thức (1đ). Điểm trừ: vắng họp chuẩn bị (-1đ), nộp trễ M-TT-01 (-1đ).',
    '[
        {
            "code": "TRACKING",
            "name": "Quá trình thực tập (Điểm theo dõi tiến độ)",
            "weight": 6.0,
            "assessorRole": "LECTURER",
            "criteria": [
                {"code": "C1", "name": "Tiến độ và thái độ thực hiện đề tài", "weight": 2.0},
                {"code": "C2", "name": "Mức độ hoàn thành kế hoạch M-TT-01", "weight": 2.0},
                {"code": "C3", "name": "Nhật ký thực tập M-TT-02 và phản hồi Mentor", "weight": 2.0}
            ]
        },
        {
            "code": "REPORT",
            "name": "Nội dung báo cáo thực tập (M-TT-05)",
            "weight": 3.0,
            "assessorRole": "LECTURER",
            "criteria": [
                {"code": "C4", "name": "Tính đúng đắn và chiều sâu chuyên môn", "weight": 1.5},
                {"code": "C5", "name": "Đóng góp thực tiễn và kết quả đạt được", "weight": 1.5}
            ]
        },
        {
            "code": "FORMAT",
            "name": "Hình thức trình bày báo cáo",
            "weight": 1.0,
            "assessorRole": "LECTURER",
            "criteria": [
                {"code": "C6", "name": "Bố cục, quy cách và văn phong khoa học", "weight": 1.0}
            ]
        }
    ]'::jsonb,
    8,
    3,
    FALSE,
    TRUE,
    'APPROVED',
    NOW(),
    0
)
ON CONFLICT (term_id, program_id, cohort_code, course_code, revision) DO NOTHING;

-- Scheme B: Mạng máy tính & Truyền thông (MMT) - 6.0 Cơ quan tiếp nhận, 3.0 Báo cáo, 0.5 Theo dõi, 0.5 Hình thức
INSERT INTO assessment_schemes (
    id, term_id, program_id, cohort_code, course_code, revision,
    source_reference, components, required_logbook_weeks, weekly_grace_days,
    require_midterm_report, require_final_report, status, approved_at, version
)
VALUES (
    '88888888-8888-8888-8888-888888888802',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222224',
    'K47',
    'CT250',
    1,
    'M-TT-04-MMT: Đánh giá cơ quan (6đ), Báo cáo (3đ), Theo dõi định kỳ (0.5đ), Hình thức (0.5đ).',
    '[
        {
            "code": "COMPANY",
            "name": "Điểm đánh giá của Cơ quan tiếp nhận (M-TT-03)",
            "weight": 6.0,
            "assessorRole": "COMPANY_MENTOR"
        },
        {
            "code": "REPORT",
            "name": "Nội dung báo cáo thực tập (M-TT-05)",
            "weight": 3.0,
            "assessorRole": "LECTURER"
        },
        {
            "code": "TRACKING",
            "name": "Theo dõi tiến độ định kỳ",
            "weight": 0.5,
            "assessorRole": "LECTURER"
        },
        {
            "code": "FORMAT",
            "name": "Hình thức trình bày báo cáo",
            "weight": 0.5,
            "assessorRole": "LECTURER"
        }
    ]'::jsonb,
    8,
    3,
    FALSE,
    TRUE,
    'APPROVED',
    NOW(),
    0
)
ON CONFLICT (term_id, program_id, cohort_code, course_code, revision) DO NOTHING;

-- Scheme C: Kỹ thuật phần mềm (SE / Chung) - 5.0 Cơ quan tiếp nhận, 5.0 GVHD chấm
INSERT INTO assessment_schemes (
    id, term_id, program_id, cohort_code, course_code, revision,
    source_reference, components, required_logbook_weeks, weekly_grace_days,
    require_midterm_report, require_final_report, status, approved_at, version
)
VALUES (
    '88888888-8888-8888-8888-888888888803',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'K47',
    'CT250',
    1,
    'M-TT-04-CHUNG: Cơ quan tiếp nhận (50%), Giảng viên hướng dẫn chấm (50%).',
    '[
        {
            "code": "COMPANY",
            "name": "Điểm đánh giá của Cơ quan tiếp nhận (M-TT-03)",
            "weight": 5.0,
            "assessorRole": "COMPANY_MENTOR"
        },
        {
            "code": "LECTURER",
            "name": "Điểm Giảng viên hướng dẫn chấm báo cáo (M-TT-04)",
            "weight": 5.0,
            "assessorRole": "LECTURER"
        }
    ]'::jsonb,
    8,
    3,
    FALSE,
    TRUE,
    'APPROVED',
    NOW(),
    0
)
ON CONFLICT (term_id, program_id, cohort_code, course_code, revision) DO NOTHING;
