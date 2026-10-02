-- ====================================================================
-- INTERNLINK MIGRATION V14: CAREER GUIDE, EVENTS & JOB FAIR POSTS
-- ====================================================================

CREATE TABLE IF NOT EXISTS career_guide_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    attachment_urls JSONB DEFAULT '[]'::jsonb NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    visibility VARCHAR(30) DEFAULT 'PUBLIC' NOT NULL,
    status VARCHAR(30) DEFAULT 'PUBLISHED' NOT NULL,
    view_count INT DEFAULT 0 NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON career_guide_posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON career_guide_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON career_guide_posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON career_guide_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_posts_department ON career_guide_posts(department_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON career_guide_posts(published_at);

-- ====================================================================
-- SEED REAL CICT POSTS, JOB FAIRS, AND HANDBOOK ARTICLES
-- ====================================================================

INSERT INTO career_guide_posts (
    id,
    department_id,
    author_user_id,
    slug,
    title,
    category,
    summary,
    content,
    cover_image_url,
    attachment_urls,
    tags,
    is_pinned,
    visibility,
    status,
    view_count,
    published_at,
    created_at
)
VALUES 
    (
        'b0000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '10000000-0000-0000-0000-000000000002',
        'thong-bao-ngay-hoi-viec-lam-cict-job-fair-2026',
        'Thông báo: Ngày Hội Việc Làm Công Nghệ & Khởi Nghiệp CICT Job Fair 2026',
        'JOB_FAIR',
        'Quy tụ hơn 40+ doanh nghiệp công nghệ hàng đầu tại Cần Thơ và TP.HCM với hơn 500+ chỉ tiêu tuyển dụng thực tập sinh và kỹ sư phần mềm.',
        '## 1. Giới thiệu sự kiện
Ngày hội việc làm **CICT Job Fair 2026** là sự kiện thường niên lớn nhất của Trường Công nghệ Thông tin & Truyền thông - Đại học Cần Thơ. Đây là cầu nối trực tiếp giúp sinh viên tiếp cận các cơ hội thực tập tốt nghiệp, học bổng doanh nghiệp và việc làm chính thức.

### Các hoạt động chính trong ngày hội:
* **Gian hàng tuyển dụng trực tiếp**: Gặp gỡ và phỏng vấn trực tiếp với đại diện nhân sự từ FPT Software, VNPT, Viettel, TMA Solutions, Axon Active, NashTech...
* **Workshop Kỹ năng Chuyên sâu**: Bí quyết vượt qua vòng Technical Interview & Live Coding.
* **Tư vấn và Sửa CV 1:1**: Nhận góp ý trực tiếp từ các chuyên gia tuyển dụng hàng đầu.

## 2. Thời gian & Địa điểm
* **Thời gian**: 07:30 - 16:30, Thứ Bảy ngày 15 tháng 11 năm 2026.
* **Địa điểm**: Sảnh Nhà Học C1 & Hội trường lớn Trường CNTT&TT (Khu II, ĐH Cần Thơ).

## 3. Hướng dẫn chuẩn bị cho sinh viên
1. Mang theo ít nhất **5 bản CV in sẵn** kèm mã QR dẫn đến GitHub hoặc Portfolio dự án.
2. Trang phục lịch sự (áo sơ mi hoặc áo đồng phục trường).
3. Đăng ký trước thông qua Cổng thông tin InternLink để nhận mã Check-in ưu tiên.',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60',
        '[
            {"id": "att-1", "fileName": "So_do_gian_hang_CICT_JobFair_2026.pdf", "fileUrl": "https://example.com/sodo.pdf", "fileSize": "2.4 MB", "fileType": "PDF"},
            {"id": "att-2", "fileName": "Danh_sach_40_Doanh_nghiep_tuyen_dung.xlsx", "fileUrl": "https://example.com/ds.xlsx", "fileSize": "1.1 MB", "fileType": "XLSX"}
        ]'::jsonb,
        '["Job Fair 2026", "Tuyển dụng", "Sự kiện lớn", "FPT", "VNPT"]'::jsonb,
        TRUE,
        'PUBLIC',
        'PUBLISHED',
        1420,
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        '11111111-1111-1111-1111-111111111111',
        '10000000-0000-0000-0000-000000000002',
        'hoc-bong-thuc-tap-sinh-tai-nhat-ban-fpt-japan-2027',
        'Chương trình Thực tập sinh Trao đổi Quốc tế tại Nhật Bản (Kỳ mùa Xuân 2027)',
        'INTERNATIONAL_INTERNSHIP',
        'Cơ hội thực tập 6 tháng tại Tokyo/Osaka được tài trợ 100% vé máy bay, trợ cấp sinh hoạt 150.000 JPY/tháng và cơ hội chuyển tiếp làm việc chính thức.',
        '## 1. Mục tiêu chương trình
Chương trình Hợp tác Quốc tế giữa Trường CNTT&TT - ĐH Cần Thơ và Hiệp hội Doanh nghiệp Công nghệ Nhật Bản (JISA) mang đến cơ hội trải nghiệm môi trường làm việc chuẩn quốc tế cho sinh viên xuất sắc.

## 2. Quyền lợi thực tập sinh
* **Trợ cấp sinh hoạt**: 150.000 - 180.000 JPY / tháng (~25 - 30 triệu VNĐ).
* **Đài thọ**: 100% chi phí vé máy bay khứ hồi, bảo hiểm y tế và hỗ trợ tìm ký túc xá.
* **Cơ hội việc làm**: Được bảo lãnh visa kỹ sư làm việc lâu dài tại Nhật Bản sau khi tốt nghiệp.

## 3. Tiêu chuẩn ứng tuyển
* Sinh viên năm 3 hoặc năm 4 chuyên ngành Công nghệ thông tin, Kỹ thuật phần mềm, Hệ thống thông tin.
* Điểm trung bình tích lũy (GPA) $\ge$ 2.8/4.0.
* Trình độ tiếng Nhật tương đương JLPT N3 trở lên (hoặc N4 có tiếng Anh giao tiếp tốt).',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=60',
        '[
            {"id": "att-3", "fileName": "Thong_bao_tuyen_chon_Internship_Japan_2027.pdf", "fileUrl": "https://example.com/japan.pdf", "fileSize": "1.8 MB", "fileType": "PDF"}
        ]'::jsonb,
        '["Thực tập quốc tế", "Nhật Bản", "Học bổng", "FPT Japan"]'::jsonb,
        FALSE,
        'PUBLIC',
        'PUBLISHED',
        980,
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        '11111111-1111-1111-1111-111111111111',
        '10000000-0000-0000-0000-000000000002',
        'quy-trinh-thuc-tap-tot-nghiep-va-bieu-mau-chuan-ctu',
        'Quy chế & Quy trình Thực tập Tốt nghiệp Khoa CNTT&TT - ĐH Cần Thơ',
        'REGULATIONS_GUIDELINES',
        'Hướng dẫn chi tiết quy trình 5 bước, thời hạn nộp hồ sơ, yêu cầu nhật ký làm việc và bộ 5 biểu mẫu chuẩn M-TT-01 đến M-TT-05.',
        '## 1. Căn cứ quy chế đào tạo
Căn cứ Quy định đào tạo trình độ đại học của Trường Đại học Cần Thơ và đề cương chi tiết học phần Thực tập tốt nghiệp (Mã học phần: CT250 / CT550).

## 2. Quy trình 5 bước thực hiện
1. **Bước 1: Tra cứu danh sách đủ điều kiện & Chọn đợt thực tập**: Sinh viên kiểm tra trạng thái trên Cổng InternLink.
2. **Bước 2: Nộp đơn ứng tuyển & Nhận thư tiếp nhận**: Ứng tuyển qua cổng hoặc nộp đơn tự liên hệ (M-TT-01).
3. **Bước 3: Ký kết Thỏa thuận thực tập 3 bên (M-TT-02)** giữa Sinh viên, Doanh nghiệp và Khoa.
4. **Bước 4: Thực hiện thực tập & Ghi nhật ký**: Ghi nhận công việc hằng ngày và báo cáo tuần định kỳ.
5. **Bước 5: Đánh giá & Nghiệm thu (M-TT-04, M-TT-05)**: Mentor doanh nghiệp chấm điểm, Giảng viên đánh giá báo cáo cuối kỳ.',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60',
        '[
            {"id": "att-4", "fileName": "So_tay_Huong_dan_Thuc_tap_CICT_2026.pdf", "fileUrl": "https://example.com/sotay.pdf", "fileSize": "3.5 MB", "fileType": "PDF"},
            {"id": "att-5", "fileName": "Bo_Bieu_Mau_Thuc_Tap_M01_M05.docx", "fileUrl": "https://example.com/bieumau.docx", "fileSize": "850 KB", "fileType": "DOCX"}
        ]'::jsonb,
        '["Quy chế", "Biểu mẫu", "M-TT-01", "M-TT-05", "ĐH Cần Thơ"]'::jsonb,
        TRUE,
        'PUBLIC',
        'PUBLISHED',
        2340,
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        '11111111-1111-1111-1111-111111111111',
        '10000000-0000-0000-0000-000000000002',
        'cam-nang-viet-cv-va-ky-nang-phong-van-it',
        'Cẩm nang Viết CV Chuyên Nghiệp & Kỹ Năng Phỏng Vấn Doanh Nghiệp Công Nghệ',
        'CV_INTERVIEW_SKILLS',
        'Bí quyết tạo điểm nhấn với GitHub, trình bày dự án thực tế theo cấu trúc STAR và phương pháp trả lời câu hỏi Live Coding.',
        '## 1. Cấu trúc một bản CV IT chuẩn quốc tế
Một bản CV ấn tượng dành cho thực tập sinh IT cần đảm bảo các phần sau:
* **Thông tin cá nhân & Liên kết**: Email sinh viên, Số điện thoại, GitHub profile, LinkedIn và Portfolio online.
* **Tóm tắt mục tiêu nghề nghiệp**: 2-3 câu ngắn gọn về định hướng công nghệ (Frontend, Backend, AI/ML, DevOps...).
* **Kỹ năng chuyên môn (Technical Skills)**: Phân loại rõ theo Ngôn ngữ lập trình, Frameworks, Cơ sở dữ liệu và Công cụ (Git, Docker, Postman).
* **Dự án thực tế (Featured Projects)**: Áp dụng nguyên tắc **STAR** (Situation - Task - Action - Result).

## 2. Bí quyết chuẩn bị phỏng vấn kỹ thuật
1. Ôn tập kỹ các câu hỏi nền tảng về OOP, Cấu trúc dữ liệu & Giải thuật, Database Indexing, RESTful API.
2. Chuẩn bị sẵn máy tính và trình duyệt nếu có bài test Live Coding.
3. Luôn chuẩn bị 2-3 câu hỏi chất lượng để hỏi lại nhà tuyển dụng ở cuối buổi.',
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60',
        '[
            {"id": "att-6", "fileName": "Mau_CV_Chuan_IT_Intern_CICT.docx", "fileUrl": "https://example.com/cv_mau.docx", "fileSize": "620 KB", "fileType": "DOCX"}
        ]'::jsonb,
        '["Cẩm nang", "Viết CV", "Phỏng vấn", "GitHub", "Kỹ năng IT"]'::jsonb,
        FALSE,
        'PUBLIC',
        'PUBLISHED',
        1890,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
    ),
    (
        'b0000000-0000-0000-0000-000000000005',
        '11111111-1111-1111-1111-111111111111',
        '10000000-0000-0000-0000-000000000002',
        'workshop-ung-dung-ai-va-cloud-computing-trong-doanh-nghiep',
        'Workshop Chuyên Đề: Ứng Dụng GenAI & Cloud Computing Trong Doanh Nghiệp Phần Mềm',
        'WORKSHOP',
        'Chia sẻ từ các chuyên gia kiến trúc giải pháp (Solutions Architect) của AWS và Google Cloud về kỹ năng thực chiến cho kỹ sư trẻ.',
        '## 1. Nội dung chuyên đề
* Tổng quan về kiến trúc Microservices và Serverless trên Cloud (AWS/GCP).
* Ứng dụng LLMs và AI Agents vào quy trình phát triển phần mềm (DevSecOps).
* Q&A định hướng nghề nghiệp và cơ hội nhận voucher thi chứng chỉ Cloud quốc tế.

## 2. Đối tượng & Hình thức tham gia
* Dành cho tất cả sinh viên Khoa CNTT&TT.
* Hình thức: Trực tiếp tại Hội trường E1 kết hợp Livestream trên nền tảng Microsoft Teams.',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
        '[]'::jsonb,
        '["Workshop", "GenAI", "Cloud", "AWS", "Google Cloud"]'::jsonb,
        FALSE,
        'PUBLIC',
        'PUBLISHED',
        760,
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '12 days'
    )
ON CONFLICT (slug) DO NOTHING;
