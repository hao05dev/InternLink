-- ====================================================================
-- INTERNLINK MIGRATION V29: SEED 10 HIGH-QUALITY IT INTERNSHIP JOBS
-- Active Term: HK2-2026-2027 (96636aef-f3b9-45af-a20a-0782a93c2684)
-- Standard password for all seeded accounts: "Password@123"
-- BCrypt Hash: $2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6
-- ====================================================================

-- 1. Ensure Partner Companies are Registered & Verified
INSERT INTO companies (id, company_name, tax_code, industry, website, address, verification_status, verification_detail, verified_by_user_id, verified_at)
VALUES 
    (
        'b2c3d4e5-0000-0000-0000-222233334444',
        'Viettel Cần Thơ - Chi nhánh Tập đoàn Công nghiệp - Viễn thông Quân đội',
        '0100109106',
        'Viễn thông & Công nghệ Thông tin',
        'https://viettel.vn',
        '{"street": "Số 210 Trần Phú", "ward": "Cái Khế", "district": "Ninh Kiều", "province": "Cần Thơ"}'::jsonb,
        'VERIFIED',
        '{"partnerType": "STRATEGIC_ENTERPRISE", "safetyCheckPassed": true, "legalChecked": true}'::jsonb,
        '10000000-0000-0000-0000-000000000002',
        NOW()
    ),
    (
        'c3d4e5f6-0000-0000-0000-333344445555',
        'TMA Solutions - Trung tâm R&D và Phần mềm Nam Bộ',
        '0301476832',
        'Gia công & Xuất khẩu Phần mềm',
        'https://tmasolutions.vn',
        '{"street": "Khu Công viên Phần mềm TMA, Đường 3/2", "ward": "Xuân Khánh", "district": "Ninh Kiều", "province": "Cần Thơ"}'::jsonb,
        'VERIFIED',
        '{"partnerType": "STRATEGIC_MOU", "safetyCheckPassed": true, "legalChecked": true}'::jsonb,
        '10000000-0000-0000-0000-000000000002',
        NOW()
    )
ON CONFLICT (tax_code) DO UPDATE 
SET verification_status = 'VERIFIED',
    verified_at = NOW();

-- 2. Ensure Company Representative Accounts
INSERT INTO users (id, department_id, company_id, email, password_hash, full_name, phone_number, role, must_change_password, is_active)
VALUES
    (
        '10000000-0000-0000-0000-000000000015',
        NULL,
        '44444444-4444-4444-4444-444444444444',
        'hr.cantho@vnpt.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Nguyễn Thanh Trúc (HR VNPT Cần Thơ)',
        '0913888771',
        'COMPANY_REP',
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000025',
        NULL,
        'a1b2c3d4-0000-0000-0000-111122223333',
        'careers@lgcns.com',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Park Min Woo (HR Lead LG CNS)',
        '0913888772',
        'COMPANY_REP',
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000035',
        NULL,
        'b2c3d4e5-0000-0000-0000-222233334444',
        'tuyendung@viettelcantho.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Trần Đình Khang (HR Viettel Cần Thơ)',
        '0913888773',
        'COMPANY_REP',
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000045',
        NULL,
        'c3d4e5f6-0000-0000-0000-333344445555',
        'recruit@tmasolutions.vn',
        '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
        'Đỗ Thị Bích Ngọc (Talent Acquisition TMA)',
        '0913888774',
        'COMPANY_REP',
        FALSE,
        TRUE
    )
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

-- 3. Extend Deadline for Legacy Approved Jobs
UPDATE job_positions
SET application_deadline = '2027-06-30 23:59:59+07'
WHERE id IN (
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999'
);

-- 4. Seed 10 High-Quality Job Positions
INSERT INTO job_positions (
    id, company_id, term_id, department_id, title, work_format, location, vacancies, description,
    target_program_codes, target_learning_outcomes, benefits, stipend_amount, status,
    approved_by_user_id, approved_at, created_by_user_id, application_deadline
)
VALUES 
    -- 1. FPT Software - Java & Spring Boot Backend Developer
    (
        '70000000-0000-0000-0000-000000000001',
        '33333333-3333-3333-3333-333333333333',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Java & Spring Boot Backend Developer',
        'HYBRID',
        'Tòa nhà FPT Cần Thơ, Đường số 1, KDC Nam Long, Cái Răng, Cần Thơ',
        4,
        'Tham gia phát triển các phân hệ dịch vụ lõi (backend microservices) trên nền tảng Java 21 và Spring Boot 3. Xây dựng RESTful API chuẩn hóa, tối ưu truy vấn cơ sở dữ liệu SQL/PostgreSQL, viết Unit Test với JUnit 5/Mockito và triển khai dịch vụ bằng Docker trong môi trường làm việc chuyên nghiệp chuẩn Agile/Scrum.',
        '["SE", "CS", "IT"]'::jsonb,
        '["Nắm vững kiến trúc Microservices và REST API với Spring Boot", "Kỹ năng tối ưu truy vấn cơ sở dữ liệu quan hệ SQL", "Làm chủ quy trình phát triển phần mềm chuẩn Agile/Scrum"]'::jsonb,
        '["Phụ cấp thực tập: 5.000.000 - 6.000.000 VNĐ / tháng", "Có Mentor 1:1 hướng dẫn chuyên sâu", "Cơ hội trở thành nhân viên chính thức sau kỳ thực tập", "Hỗ trợ máy tính làm việc và tham gia các hoạt động teambuilding"]'::jsonb,
        5500000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000005',
        '2027-06-30 23:59:59+07'
    ),

    -- 2. FPT Software - Frontend Web Developer (React & TypeScript)
    (
        '70000000-0000-0000-0000-000000000002',
        '33333333-3333-3333-3333-333333333333',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Lập trình Web Frontend (React & TypeScript)',
        'ONSITE',
        'Tòa nhà FPT Cần Thơ, Đường số 1, KDC Nam Long, Cái Răng, Cần Thơ',
        3,
        'Xây dựng và phát triển giao diện người dùng (UI) hiện đại, responsive cho các ứng dụng web doanh nghiệp sử dụng React, TypeScript và Tailwind CSS. Phối hợp chặt chẽ với UI/UX designer và Backend team để tích hợp RESTful API, tối ưu trải nghiệm người dùng và đảm bảo chất lượng mã nguồn thông qua hệ thống quản lý phiên bản Git.',
        '["SE", "IT"]'::jsonb,
        '["Làm chủ thư viện React và TypeScript trong phát triển UI chuyên nghiệp", "Kỹ năng kết nối và tối ưu dữ liệu từ REST API", "Kỹ năng xây dựng giao diện responsive và chuẩn Accessibility"]'::jsonb,
        '["Phụ cấp thực tập: 4.500.000 - 5.500.000 VNĐ / tháng", "Môi trường làm việc năng động chuẩn quốc tế", "Được cấp laptop và tài khoản học tập trực tuyến FPT Software", "Xác nhận báo cáo và hỗ trợ dấu mộc thực tập"]'::jsonb,
        5000000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000005',
        '2027-06-30 23:59:59+07'
    ),

    -- 3. VNPT Cần Thơ - Kỹ sư Dữ liệu & AI (Python & FastAPI)
    (
        '70000000-0000-0000-0000-000000000003',
        '44444444-4444-4444-4444-444444444444',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Kỹ sư Dữ liệu & AI (Python & FastAPI)',
        'HYBRID',
        'Trung tâm CNTT VNPT Cần Thơ, Số 02 Nguyễn Trãi, Ninh Kiều, Cần Thơ',
        2,
        'Tham gia nghiên cứu, xử lý và làm sạch dữ liệu lớn phục vụ các bài toán chuyển đổi số hành chính công và đô thị thông minh. Xây dựng pipeline dữ liệu và phát triển các dịch vụ API phục vụ mô hình học máy (Machine Learning) sử dụng ngôn ngữ Python, framework FastAPI, quản trị dữ liệu với PostgreSQL và triển khai container hóa qua Docker.',
        '["CS", "SE", "IT"]'::jsonb,
        '["Kỹ năng thu thập, tiền xử lý và trực quan hóa dữ liệu với Python", "Xây dựng High-performance REST API bằng FastAPI", "Thao tác cơ sở dữ liệu quan hệ nâng cao với PostgreSQL"]'::jsonb,
        '["Phụ cấp thực tập: 5.000.000 - 6.000.000 VNĐ / tháng", "Tham gia các dự án chuyển đổi số cấp tỉnh thành", "Được hướng dẫn bởi các chuyên gia dữ liệu đầu ngành của VNPT", "Cơ hội tuyển dụng chính thức vào Trung tâm CNTT"]'::jsonb,
        5500000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000015',
        '2027-06-30 23:59:59+07'
    ),

    -- 4. VNPT Cần Thơ - Phát triển Ứng dụng Di động (Flutter & Mobile App)
    (
        '70000000-0000-0000-0000-000000000004',
        '44444444-4444-4444-4444-444444444444',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Phát triển Ứng dụng Di động (Flutter & Mobile App)',
        'ONSITE',
        'Trung tâm CNTT VNPT Cần Thơ, Số 02 Nguyễn Trãi, Ninh Kiều, Cần Thơ',
        3,
        'Tham gia thiết kế và lập trình ứng dụng di động đa nền tảng (iOS & Android) phục vụ người dân và doanh nghiệp số bằng Flutter. Tích hợp RESTful API, quản lý trạng thái ứng dụng (state management), tối ưu hiệu năng render và xử lý ngoại tuyến (offline caching) theo quy trình kiểm thử và phát hành tiêu chuẩn.',
        '["SE", "IT"]'::jsonb,
        '["Nắm vững kiến trúc phát triển ứng dụng di động đa nền tảng với Flutter", "Tích hợp REST API và cơ chế đồng bộ dữ liệu ngoại tuyến", "Kỹ năng gỡ lỗi và tối ưu hiệu năng ứng dụng di động"]'::jsonb,
        '["Hỗ trợ sinh hoạt phí 4.500.000 VNĐ / tháng", "Môi trường doanh nghiệp viễn thông công nghệ quốc gia", "Xác nhận và hỗ trợ hoàn tất đề tài thực tập tốt nghiệp", "Hỗ trợ thiết bị kiểm thử ứng dụng đa thiết bị"]'::jsonb,
        4500000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000015',
        '2027-06-30 23:59:59+07'
    ),

    -- 5. LG CNS Việt Nam - Cloud Native & DevOps Engineer
    (
        '70000000-0000-0000-0000-000000000005',
        'a1b2c3d4-0000-0000-0000-111122223333',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Cloud Native & DevOps Engineer',
        'REMOTE',
        'Tầng 15, Tòa nhà Bitexco, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        2,
        'Được đào tạo và tham gia vận hành hạ tầng đám mây cho các hệ thống phần mềm quy mô lớn của tập đoàn LG. Quản lý và đóng gói ứng dụng bằng Docker & Kubernetes, xây dựng luồng tự động hóa CI/CD bằng GitHub Actions/GitLab CI, vận hành hệ thống máy chủ Linux và làm quen với các dịch vụ điện toán đám mây AWS.',
        '["CS", "SE", "IT"]'::jsonb,
        '["Vận hành container với Docker và điều phối cụm Kubernetes", "Thiết lập pipeline CI/CD tự động kiểm thử và triển khai", "Làm chủ môi trường hệ điều hành máy chủ Linux và Cloud AWS"]'::jsonb,
        '["Phụ cấp hấp dẫn: 6.500.000 VNĐ / tháng", "Làm việc linh hoạt từ xa (100% Remote)", "Tiếp cận hạ tầng đám mây chuẩn quốc tế của LG CNS", "Được tài trợ thi các chứng chỉ quốc tế như AWS Certified, CKA"]'::jsonb,
        6500000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000025',
        '2027-06-30 23:59:59+07'
    ),

    -- 6. LG CNS Việt Nam - Backend .NET Core & Microservices
    (
        '70000000-0000-0000-0000-000000000006',
        'a1b2c3d4-0000-0000-0000-111122223333',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Backend .NET Core & Microservices',
        'HYBRID',
        'Tầng 15, Tòa nhà Bitexco, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        3,
        'Tham gia phát triển các giải pháp phần mềm quản trị doanh nghiệp (ERP, Smart Factory) bằng nền tảng .NET Core / C# và kiến trúc Microservices. Thiết kế cơ sở dữ liệu quan hệ SQL, xây dựng REST API hiệu năng cao, ứng dụng Redis cache và viết mã nguồn tuân thủ các nguyên lý hướng đối tượng OOP và Design Patterns.',
        '["SE", "IT"]'::jsonb,
        '["Nắm vững lập trình C# hướng đối tượng và ASP.NET Core Web API", "Hiểu và áp dụng kiến trúc Microservices và Design Patterns", "Tối ưu bộ đệm phân tán với Redis và cơ sở dữ liệu SQL"]'::jsonb,
        '["Phụ cấp thực tập: 6.000.000 VNĐ / tháng", "Làm việc cùng các kỹ sư cao cấp Hàn Quốc và Việt Nam", "Tham gia các khóa đào tạo nâng cao năng lực công nghệ và ngoại ngữ", "Xét tuyển thẳng vào vị trí Junior Software Engineer"]'::jsonb,
        6000000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000025',
        '2027-06-30 23:59:59+07'
    ),

    -- 7. Viettel Cần Thơ - Automation QA/QC Test Engineer
    (
        '70000000-0000-0000-0000-000000000007',
        'b2c3d4e5-0000-0000-0000-222233334444',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Kỹ sư Kiểm thử Tự động (Automation QA/QC)',
        'ONSITE',
        'Tòa nhà Viettel Cần Thơ, Số 210 Trần Phú, Cái Khế, Ninh Kiều, Cần Thơ',
        3,
        'Tham gia vào quy trình đảm bảo chất lượng phần mềm (QA/QC) cho các nền tảng số của Viettel. Nghiên cứu tài liệu yêu cầu, thiết kế kịch bản kiểm thử (Test Case), xây dựng bộ kiểm thử tự động (Automation Test) sử dụng Python, Selenium/Playwright và Unit Test, tích hợp kiểm thử liên tục vào quy trình CI/CD.',
        '["SE", "IT"]'::jsonb,
        '["Quy trình kiểm thử phần mềm chuyên nghiệp từ Unit Test đến E2E", "Kỹ năng lập trình kịch bản tự động hóa bằng Python", "Tích hợp kiểm thử tự động vào hệ thống CI/CD"]'::jsonb,
        '["Phụ cấp thực tập: 5.000.000 VNĐ / tháng", "Môi trường doanh nghiệp viễn thông - công nghệ hàng đầu Việt Nam", "Được đào tạo bài bản về phương pháp luận Agile và quy trình QA", "Hỗ trợ đầy đủ tài liệu và nhận xét kết quả thực tập"]'::jsonb,
        5000000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000035',
        '2027-06-30 23:59:59+07'
    ),

    -- 8. Viettel Cần Thơ - Lập trình Full-stack (Node.js & Next.js)
    (
        '70000000-0000-0000-0000-000000000008',
        'b2c3d4e5-0000-0000-0000-222233334444',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Lập trình Full-stack (Node.js & Next.js)',
        'HYBRID',
        'Tòa nhà Viettel Cần Thơ, Số 210 Trần Phú, Cái Khế, Ninh Kiều, Cần Thơ',
        4,
        'Phát triển toàn diện từ giao diện người dùng đến dịch vụ backend cho các cổng dịch vụ trực tuyến. Ứng dụng Next.js, TypeScript và Tailwind CSS cho Frontend; xây dựng REST API và GraphQL bằng Node.js / NestJS cho Backend; kết nối cơ sở dữ liệu PostgreSQL và quản lý mã nguồn bài bản trên Git.',
        '["SE", "IT", "CS"]'::jsonb,
        '["Phát triển ứng dụng Web Full-stack hiện đại với Next.js & Node.js", "Quản lý cơ sở dữ liệu quan hệ với PostgreSQL và ORM Prisma/TypeORM", "Tư duy thiết kế hệ thống và bảo mật ứng dụng Web"]'::jsonb,
        '["Phụ cấp thực tập: 5.500.000 VNĐ / tháng", "Tham gia các dự án phát triển sản phẩm thực tế của Viettel", "Được hỗ trợ trang thiết bị làm việc hiện đại", "Cơ hội ưu tiên tuyển dụng chính thức khi tốt nghiệp"]'::jsonb,
        5500000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000035',
        '2027-06-30 23:59:59+07'
    ),

    -- 9. TMA Solutions - Kỹ sư Hệ thống Phân tán Go (Golang Backend)
    (
        '70000000-0000-0000-0000-000000000009',
        'c3d4e5f6-0000-0000-0000-333344445555',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Kỹ sư Hệ thống Phân tán Go (Golang Backend)',
        'HYBRID',
        'Khu Công viên Phần mềm TMA, Đường 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ',
        3,
        'Tham gia nghiên cứu và xây dựng các dịch vụ backend hiệu năng cao, chịu tải lớn cho khách hàng quốc tế bằng ngôn ngữ Go (Golang). Thiết kế và hiện thực các dịch vụ theo kiến trúc Microservices, giao tiếp qua REST API và gRPC, tối ưu lưu trữ với SQL/PostgreSQL và đóng gói triển khai bằng Docker.',
        '["CS", "SE"]'::jsonb,
        '["Lập trình đồng thời (Concurrency) và tối ưu hiệu năng bằng Go", "Xây dựng dịch vụ theo mô hình Microservices phân tán", "Kỹ năng container hóa và triển khai dịch vụ bằng Docker"]'::jsonb,
        '["Phụ cấp thực tập: 5.500.000 - 6.500.000 VNĐ / tháng", "Môi trường gia công phần mềm quy mô toàn cầu", "Được hướng dẫn bởi các Tech Lead giàu kinh nghiệm tại TMA", "Được đào tạo kỹ năng tiếng Anh chuyên ngành miễn phí"]'::jsonb,
        6000000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000045',
        '2027-06-30 23:59:59+07'
    ),

    -- 10. TMA Solutions - Lập trình Web Full-stack (Python Django & Vue.js)
    (
        '70000000-0000-0000-0000-000000000010',
        'c3d4e5f6-0000-0000-0000-333344445555',
        '96636aef-f3b9-45af-a20a-0782a93c2684',
        '11111111-1111-1111-1111-111111111111',
        'Thực tập sinh Lập trình Web Full-stack (Python Django & Vue.js)',
        'ONSITE',
        'Khu Công viên Phần mềm TMA, Đường 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ',
        3,
        'Tham gia phát triển các nền tảng ứng dụng web quản lý dữ liệu cho đối tác quốc tế. Xây dựng dịch vụ API bằng Python và Django Rest Framework; phát triển giao diện đơn trang SPA tương tác mượt mà bằng Vue.js; làm việc với cơ sở dữ liệu quan hệ SQL và tuân thủ quy trình phát triển Agile tiêu chuẩn.',
        '["SE", "IT"]'::jsonb,
        '["Thành thạo xây dựng API chuẩn hóa với Python & Django Framework", "Lập trình giao diện Single Page Application (SPA) với Vue.js", "Kỹ năng làm việc nhóm và giao tiếp trong môi trường dự án quốc tế"]'::jsonb,
        '["Phụ cấp thực tập: 5.000.000 VNĐ / tháng", "Cơ sở vật chất hiện đại tại Công viên phần mềm TMA Cần Thơ", "Có xe đưa đón và khu vực pantry đồ uống miễn phí", "Cơ hội nhận việc chính thức ngay sau khi kết thúc thực tập"]'::jsonb,
        5000000.00,
        'APPROVED',
        '10000000-0000-0000-0000-000000000002',
        NOW(),
        '10000000-0000-0000-0000-000000000045',
        '2027-06-30 23:59:59+07'
    )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    work_format = EXCLUDED.work_format,
    location = EXCLUDED.location,
    vacancies = EXCLUDED.vacancies,
    target_program_codes = EXCLUDED.target_program_codes,
    target_learning_outcomes = EXCLUDED.target_learning_outcomes,
    benefits = EXCLUDED.benefits,
    stipend_amount = EXCLUDED.stipend_amount,
    status = 'APPROVED',
    application_deadline = EXCLUDED.application_deadline,
    updated_at = NOW();

-- 5. Link Skills to the 10 Job Positions
INSERT INTO job_skills (job_id, skill_id, requirement_type, required_level, weight)
VALUES
    -- Job 1: Java & Spring Boot Backend Developer
    ('70000000-0000-0000-0000-000000000001', 'SK-JAVA', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000001', 'SK-SPRING-BOOT', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000001', 'SK-SQL', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000001', 'SK-DOCKER', 'OPTIONAL', 'BEGINNER', 0.6),
    ('70000000-0000-0000-0000-000000000001', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 2: Frontend Web Developer (React & TypeScript)
    ('70000000-0000-0000-0000-000000000002', 'SK-JS', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000002', 'SK-TS', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000002', 'SK-REACT', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000002', 'SK-TAILWIND', 'OPTIONAL', 'BEGINNER', 0.6),
    ('70000000-0000-0000-0000-000000000002', 'SK-HTML-CSS', 'OPTIONAL', 'INTERMEDIATE', 0.7),
    ('70000000-0000-0000-0000-000000000002', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 3: Kỹ sư Dữ liệu & AI (Python & FastAPI)
    ('70000000-0000-0000-0000-000000000003', 'SK-PYTHON', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000003', 'SK-SQL', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000003', 'SK-FASTAPI', 'MANDATORY', 'BEGINNER', 0.8),
    ('70000000-0000-0000-0000-000000000003', 'SK-POSTGRESQL', 'OPTIONAL', 'INTERMEDIATE', 0.7),
    ('70000000-0000-0000-0000-000000000003', 'SK-DOCKER', 'OPTIONAL', 'BEGINNER', 0.6),
    ('70000000-0000-0000-0000-000000000003', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 4: Phát triển Ứng dụng Di động (Flutter & Mobile App)
    ('70000000-0000-0000-0000-000000000004', 'SK-FLUTTER', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000004', 'SK-REST-API', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000004', 'SK-PROBLEM-SOLVING', 'MANDATORY', 'INTERMEDIATE', 0.7),
    ('70000000-0000-0000-0000-000000000004', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),
    ('70000000-0000-0000-0000-000000000004', 'SK-ENGLISH', 'OPTIONAL', 'BEGINNER', 0.5),

    -- Job 5: Cloud Native & DevOps Engineer
    ('70000000-0000-0000-0000-000000000005', 'SK-LINUX', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000005', 'SK-DOCKER', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000005', 'SK-GIT', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000005', 'SK-KUBERNETES', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000005', 'SK-AWS', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000005', 'SK-CICD', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 6: Backend .NET Core & Microservices
    ('70000000-0000-0000-0000-000000000006', 'SK-CSHARP', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000006', 'SK-DOTNET', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000006', 'SK-SQL', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000006', 'SK-MICROSERVICES', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000006', 'SK-REDIS', 'OPTIONAL', 'BEGINNER', 0.6),
    ('70000000-0000-0000-0000-000000000006', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 7: Automation QA/QC Test Engineer
    ('70000000-0000-0000-0000-000000000007', 'SK-UNIT-TEST', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000007', 'SK-PYTHON', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000007', 'SK-GIT', 'MANDATORY', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000007', 'SK-CICD', 'OPTIONAL', 'BEGINNER', 0.6),
    ('70000000-0000-0000-0000-000000000007', 'SK-PROBLEM-SOLVING', 'OPTIONAL', 'INTERMEDIATE', 0.7),

    -- Job 8: Lập trình Full-stack (Node.js & Next.js)
    ('70000000-0000-0000-0000-000000000008', 'SK-NODEJS', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000008', 'SK-NEXTJS', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000008', 'SK-TS', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000008', 'SK-POSTGRESQL', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000008', 'SK-TAILWIND', 'OPTIONAL', 'INTERMEDIATE', 0.7),
    ('70000000-0000-0000-0000-000000000008', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 9: Kỹ sư Hệ thống Phân tán Go (Golang Backend)
    ('70000000-0000-0000-0000-000000000009', 'SK-GOLANG', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000009', 'SK-REST-API', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000009', 'SK-SQL', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000009', 'SK-DOCKER', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000009', 'SK-MICROSERVICES', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000009', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6),

    -- Job 10: Lập trình Web Full-stack (Python Django & Vue.js)
    ('70000000-0000-0000-0000-000000000010', 'SK-PYTHON', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('70000000-0000-0000-0000-000000000010', 'SK-DJANGO', 'MANDATORY', 'INTERMEDIATE', 0.9),
    ('70000000-0000-0000-0000-000000000010', 'SK-SQL', 'MANDATORY', 'INTERMEDIATE', 0.8),
    ('70000000-0000-0000-0000-000000000010', 'SK-VUE', 'OPTIONAL', 'BEGINNER', 0.7),
    ('70000000-0000-0000-0000-000000000010', 'SK-REST-API', 'OPTIONAL', 'INTERMEDIATE', 0.7),
    ('70000000-0000-0000-0000-000000000010', 'SK-GIT', 'OPTIONAL', 'BEGINNER', 0.6)
ON CONFLICT (job_id, skill_id) DO UPDATE
SET requirement_type = EXCLUDED.requirement_type,
    required_level = EXCLUDED.required_level,
    weight = EXCLUDED.weight;
