-- ====================================================================
-- SEED DATA: ĐỊA GIỚI HÀNH CHÍNH & CƠ CẤU TRƯỜNG ĐẠI HỌC MẪU
-- ====================================================================

-- 1. Tỉnh / Thành phố mẫu
INSERT INTO provinces (id, province_name, code) VALUES
(1, 'Thành phố Hồ Chí Minh', '79'),
(2, 'Thành phố Hà Nội', '01'),
(3, 'Thành phố Đà Nẵng', '48'),
(4, 'Tỉnh Bình Dương', '74'),
(5, 'Thành phố Cần Thơ', '92')
ON CONFLICT (id) DO NOTHING;

-- 2. Quận / Huyện mẫu tại TP.HCM
INSERT INTO districts (id, province_id, district_name, code) VALUES
(1, 1, 'Thành phố Thủ Đức', '769'),
(2, 1, 'Quận 1', '760'),
(3, 1, 'Quận 7', '778'),
(4, 1, 'Quận Bình Thạnh', '765'),
(5, 2, 'Quận Cầu Giấy', '005'),
(6, 2, 'Quận Hai Bà Trưng', '007')
ON CONFLICT (id) DO NOTHING;

-- 3. Phường / Xã mẫu
INSERT INTO wards (id, district_id, ward_name, code) VALUES
(1, 1, 'Phường Linh Trung', '26734'),
(2, 1, 'Phường Tăng Nhơn Phú A', '26743'),
(3, 1, 'Phường Hiệp Phú', '26740'),
(4, 2, 'Phường Bến Nghé', '26746'),
(5, 4, 'Phường 25', '26848'),
(6, 5, 'Phường Dịch Vọng Hậu', '00172')
ON CONFLICT (id) DO NOTHING;

-- Reset Sequences cho các bảng hành chính
SELECT setval('provinces_id_seq', (SELECT MAX(id) FROM provinces));
SELECT setval('districts_id_seq', (SELECT MAX(id) FROM districts));
SELECT setval('wards_id_seq', (SELECT MAX(id) FROM wards));

-- 4. Địa chỉ mẫu
INSERT INTO addresses (id, ward_id, address_line, region_type) VALUES
(1, 1, 'Số 1 Võ Văn Ngân', 'CAMPUS'),
(2, 3, 'Khu Công Nghệ Cao, Đường D1', 'HEADQUARTERS'),
(3, 4, 'Số 2 Hải Triều, Tòa nhà Bitexco', 'BRANCH')
ON CONFLICT (id) DO NOTHING;
SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM addresses));

-- 5. Trường Đại học mẫu
INSERT INTO universities (id, university_name, code, website, address_id) VALUES
(1, 'Trường Đại học Sư phạm Kỹ thuật TP.HCM', 'HCMUTE', 'https://hcmute.edu.vn', 1),
(2, 'Trường Đại học Công nghệ Thông tin - ĐHQG-HCM', 'UIT', 'https://uit.edu.vn', 1)
ON CONFLICT (id) DO NOTHING;
SELECT setval('universities_id_seq', (SELECT MAX(id) FROM universities));

-- 6. Khoa / Bộ môn mẫu
INSERT INTO departments (id, university_id, department_name, department_type, description) VALUES
(1, 1, 'Khoa Công nghệ Thông tin', 'FACULTY', 'Quản lý sinh viên và chương trình đào tạo ngành CNTT, KTPM, TTNT'),
(2, 1, 'Bộ môn Kỹ thuật Phần mềm', 'ACADEMIC_DEPARTMENT', 'Chịu trách nhiệm học phần Thực tập doanh nghiệp ngành KTPM'),
(3, 1, 'Phòng Quan hệ Doanh nghiệp & Quản lý Thực tập', 'INTERNSHIP_OFFICE', 'Đầu mối liên hệ, thẩm định doanh nghiệp và ký kết thỏa thuận hợp tác')
ON CONFLICT (id) DO NOTHING;
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));