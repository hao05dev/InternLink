-- AssessmentRules.validate yêu cầu trọng số thành phần và tiêu chí là phân số (tổng mỗi cấp = 1).
-- Dữ liệu seed V30 dùng thang điểm (6.0 / 3.0 / 1.0) nên không qua được kiểm tra này và làm
-- điểm tổng kết sai. Chuẩn hóa lại ba phương án mẫu, giữ nguyên tỉ lệ ban đầu.

UPDATE assessment_schemes
SET components = '[
    {
        "code": "TRACKING",
        "name": "Quá trình thực tập (Điểm theo dõi tiến độ)",
        "weight": 0.6,
        "assessorRole": "LECTURER",
        "criteria": [
            {"code": "C1", "name": "Tiến độ và thái độ thực hiện đề tài", "weight": 0.34},
            {"code": "C2", "name": "Mức độ hoàn thành kế hoạch M-TT-01", "weight": 0.33},
            {"code": "C3", "name": "Nhật ký thực tập M-TT-02 và phản hồi Mentor", "weight": 0.33}
        ]
    },
    {
        "code": "REPORT",
        "name": "Nội dung báo cáo thực tập (M-TT-05)",
        "weight": 0.3,
        "assessorRole": "LECTURER",
        "criteria": [
            {"code": "C4", "name": "Tính đúng đắn và chiều sâu chuyên môn", "weight": 0.5},
            {"code": "C5", "name": "Đóng góp thực tiễn và kết quả đạt được", "weight": 0.5}
        ]
    },
    {
        "code": "FORMAT",
        "name": "Hình thức trình bày báo cáo",
        "weight": 0.1,
        "assessorRole": "LECTURER",
        "criteria": [
            {"code": "C6", "name": "Bố cục, quy cách và văn phong khoa học", "weight": 1.0}
        ]
    }
]'::jsonb
WHERE id = '88888888-8888-8888-8888-888888888801';

UPDATE assessment_schemes
SET components = '[
    {"code": "COMPANY", "name": "Điểm đánh giá của Cơ quan tiếp nhận (M-TT-03)", "weight": 0.6, "assessorRole": "COMPANY_MENTOR"},
    {"code": "REPORT", "name": "Nội dung báo cáo thực tập (M-TT-05)", "weight": 0.3, "assessorRole": "LECTURER"},
    {"code": "TRACKING", "name": "Theo dõi tiến độ định kỳ", "weight": 0.05, "assessorRole": "LECTURER"},
    {"code": "FORMAT", "name": "Hình thức trình bày báo cáo", "weight": 0.05, "assessorRole": "LECTURER"}
]'::jsonb
WHERE id = '88888888-8888-8888-8888-888888888802';

UPDATE assessment_schemes
SET components = '[
    {"code": "COMPANY", "name": "Điểm đánh giá của Cơ quan tiếp nhận (M-TT-03)", "weight": 0.5, "assessorRole": "COMPANY_MENTOR"},
    {"code": "LECTURER", "name": "Điểm Giảng viên hướng dẫn chấm báo cáo (M-TT-04)", "weight": 0.5, "assessorRole": "LECTURER"}
]'::jsonb
WHERE id = '88888888-8888-8888-8888-888888888803';
