export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    publishedAt: string;
    author: {
        name: string;
        role: string;
        avatar?: string;
    };
    coverImage: string;
    tags: string[];
    content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: "post-1",
        slug: "huong-dan-viet-cv-thuc-tap-it-chuan-doanh-nghiep",
        title: "Hướng dẫn xây dựng CV thực tập IT chuyên nghiệp và gây ấn tượng với nhà tuyển dụng",
        excerpt: "Bí quyết trình bày đồ án môn học, kỹ năng công nghệ (Java, React, SQL) và chứng chỉ một cách nổi bật trong CV dành cho sinh viên năm 3-4.",
        category: "Kỹ năng ứng tuyển",
        readTime: "5 phút đọc",
        publishedAt: "26/09/2026",
        author: {
            name: "Ban Hỗ trợ Việc làm Sinh viên CICT",
            role: "Cán bộ Hướng nghiệp",
        },
        coverImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=60",
        tags: ["CV Thực tập", "Kỹ năng mềm", "Sinh viên IT"],
        content: [
            "Đối với sinh viên chuẩn bị bước vào học kỳ thực tập doanh nghiệp, CV là chiếc cầu nối đầu tiên giữa bạn và nhà tuyển dụng. Thay vì chỉ liệt kê các môn học đã qua, hãy làm nổi bật những đồ án môn học cụ thể.",
            "Hãy trình bày rõ ràng: Vai trò của bạn trong dự án nhóm (Backend/Frontend), công nghệ đã áp dụng (Spring Boot, Next.js, PostgreSQL), kiến trúc hệ thống và kết quả đạt được.",
            "Đặc biệt, đừng quên dẫn đường link GitHub cá nhân có mã nguồn sạch, tài liệu README rõ ràng và link triển khai thử nghiệm (demo) nếu có.",
            "Nhà tuyển dụng luôn đánh giá cao những ứng viên có tư duy logic tốt, trung thực về mức độ hiểu biết kỹ năng và sẵn sàng học hỏi công nghệ mới tại môi trường thực tế."
        ]
    },
    {
        id: "post-2",
        slug: "quy-trinh-12-buoc-thuc-tap-doanh-nghiep-cict-ctu",
        title: "Toàn văn Quy trình 12 bước tổ chức Thực tập Doanh nghiệp tại Khoa CNTT&TT",
        excerpt: "Từ giai đoạn mở đợt đăng ký, xét duyệt chỉ tiêu, ký thỏa thuận học tập (Learning Agreement) đến đánh giá nghiệm thu cuối kỳ.",
        category: "Quy chế & Hướng dẫn",
        readTime: "7 phút đọc",
        publishedAt: "24/09/2026",
        author: {
            name: "Ban Quản lý Thực tập CICT",
            role: "Phòng Đào tạo & QLTT",
        },
        coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60",
        tags: ["Quy chế thực tập", "Học phần thực tập", "ĐH Cần Thơ"],
        content: [
            "Học phần Thực tập doanh nghiệp là học phần bắt buộc có tính chất chuyển tiếp quan trọng từ môi trường giảng đường sang môi trường công nghiệp chuyên nghiệp.",
            "Quy trình được chia làm 3 giai đoạn chính: Tiền thực tập (Đăng ký nguyện vọng, phỏng vấn tiếp nhận, ký kết thỏa thuận), Trong thực tập (Ghi nhật ký công việc hàng tuần, báo cáo tiến độ với Giảng viên hướng dẫn), và Hậu thực tập (Đánh giá của Mentor công ty, nộp báo cáo tốt nghiệp và bảo vệ trước hội đồng).",
            "Sinh viên cần lưu ý tuân thủ đúng các mốc thời gian quy định trên Cổng thông tin Thực tập InternLink để đảm bảo quyền lợi tích lũy tín chỉ."
        ]
    },
    {
        id: "post-3",
        slug: "kinh-nghiem-ghi-nhat-ky-thuc-tap-dat-diem-cao",
        title: "Phương pháp ghi chép Nhật ký tuần (Weekly Log) và Báo cáo tổng kết đạt điểm xuất sắc",
        excerpt: "Hướng dẫn liên kết công việc thực tế tại công ty với Chuẩn đầu ra học phần (CLO) để Giảng viên và Mentor dễ dàng cho điểm tối đa.",
        category: "Kinh nghiệm thực tập",
        readTime: "4 phút đọc",
        publishedAt: "20/09/2026",
        author: {
            name: "ThS. Nguyễn Thái Sơn",
            role: "Giảng viên Hướng dẫn CICT",
        },
        coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
        tags: ["Weekly Log", "Báo cáo thực tập", "Đánh giá CLO"],
        content: [
            "Một lỗi phổ biến của sinh viên khi ghi nhật ký tuần là chỉ viết chung chung như 'Hôm nay fix bug' hoặc 'Lên công ty học công nghệ'. Giảng viên hướng dẫn không thể đánh giá được năng lực của bạn qua những dòng ngắn như vậy.",
            "Cách ghi đúng: Nêu rõ bài toán được giao, giải pháp kỹ thuật đã lựa chọn, khó khăn gặp phải và cách bạn tự giải quyết hoặc xin hướng dẫn từ Mentor.",
            "Cuối mỗi tuần, hãy liên hệ kết quả công việc với Chuẩn đầu ra của học phần: bạn đã rèn luyện được kỹ năng làm việc nhóm nào, học được kiến trúc phần mềm nào mới."
        ]
    },
    {
        id: "post-4",
        slug: "nhung-dieu-can-chuan-bi-truoc-khi-onboarding-doanh-nghiep",
        title: "Những điều cần chuẩn bị trong tuần đầu tiên bước vào môi trường doanh nghiệp công nghệ",
        excerpt: "Từ văn hóa công sở, tính kỷ luật, bảo mật thông tin mã nguồn đến cách chủ động đặt câu hỏi với Mentor.",
        category: "Kinh nghiệm thực tập",
        readTime: "6 phút đọc",
        publishedAt: "18/09/2026",
        author: {
            name: "Kỹ sư Phạm Nhật Nam",
            role: "Tech Lead & Mentor FPT Software",
        },
        coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=60",
        tags: ["Onboarding", "Văn hóa công sở", "Mentor hướng dẫn"],
        content: [
            "Tuần đầu tiên tại doanh nghiệp là thời điểm làm quen với quy trình nội bộ, cài đặt môi trường phát triển và tìm hiểu kiến trúc dự án thực tế.",
            "Hãy chủ động đọc kỹ tài liệu nghiệp vụ, không ngần ngại đặt câu hỏi sau khi đã tự tìm hiểu (Google/tài liệu) ít nhất 15-30 phút.",
            "Tuyệt đối tuân thủ quy tắc bảo mật dữ liệu khách hàng: không chia sẻ mã nguồn công ty ra ngoài, tuân thủ quy định sử dụng máy tính và giờ giấc làm việc."
        ]
    }
];
