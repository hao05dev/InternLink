INSERT INTO nace_competencies (code, name, description) VALUES
('CRITICAL_THINKING', 'Tư duy phản biện & Giải quyết vấn đề', 'Phân tích thông tin, xử lý lỗi kỹ thuật, đưa ra giải pháp logic.'),
('COMMUNICATION', 'Giao tiếp hiệu quả', 'Trình bày ý tưởng rõ ràng, viết báo cáo kỹ thuật, lắng nghe phản hồi.'),
('TEAMWORK', 'Làm việc nhóm & Hợp tác', 'Xây dựng mối quan hệ làm việc tích cực, phối hợp cùng đồng đội và mentor.'),
('TECHNOLOGY', 'Năng lực công nghệ số', 'Thành thạo công cụ, ngôn ngữ lập trình, hệ quản trị CSDL và quy trình CI/CD.'),
('PROFESSIONALISM', 'Tác phong chuyên nghiệp & Đạo đức', 'Đúng giờ, tinh thần trách nhiệm, tuân thủ kỷ luật và bảo mật thông tin doanh nghiệp.'),
('LEADERSHIP', 'Khả năng dẫn dắt & Chủ động', 'Chủ động nhận nhiệm vụ, truyền cảm hứng và đề xuất cải tiến quy trình.'),
('CAREER_DEVELOPMENT', 'Phát triển nghề nghiệp & Bản thân', 'Tự nhận thức điểm mạnh/yếu, chủ động học hỏi công nghệ mới.'),
('EQUITY_INCLUSION', 'Hòa nhập & Tôn trọng đa dạng', 'Tôn trọng văn hóa doanh nghiệp, công bằng và tôn trọng đồng nghiệp.')
ON CONFLICT (code) DO NOTHING;