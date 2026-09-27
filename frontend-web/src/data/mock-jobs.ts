import { JobPosition } from "@/types/job";

export const MOCK_JOBS: JobPosition[] = [
    {
        id: "88888888-8888-8888-8888-888888888888",
        companyId: "33333333-3333-3333-3333-333333333333",
        companyName: "FPT Software Cần Thơ",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
        companyScale: "1.000 - 4.999 nhân viên",
        companyIndustry: "Công nghệ thông tin & Phần mềm",
        companyWebsite: "https://fptsoftware.com",
        companyAddress: "Đường số 1, KDC Nam Long, Phường Hưng Thạnh, Quận Cái Răng, TP. Cần Thơ",
        termId: "55555555-5555-5555-5555-555555555555",
        termName: "Học kỳ 1 Năm học 2026 - 2027",
        title: "THỰC TẬP SINH AUTOMATION TEST ENGINEER (JAVA / PLAYWRIGHT)",
        workFormat: "ONSITE",
        location: "Cần Thơ",
        vacancies: 3,
        stipendAmount: 5500000,
        deadline: "20/11/2026",
        applicantCount: 2,
        experienceLevel: "Sinh viên năm 3 - 4",
        status: "APPROVED",
        description: "Tham gia vào dự án chuyển đổi số quốc tế của tập đoàn. Được đào tạo chuyên sâu về quy trình kiểm thử tự động, xây dựng framework Automation Test với Java, Selenium WebDriver và Playwright. Tham gia trực tiếp vào quy trình CI/CD và phối hợp cùng đội ngũ kỹ sư giải pháp.",
        requirements: [
            "Sinh viên năm 3 hoặc năm 4 chuyên ngành Kỹ thuật phần mềm, CNTT, HTTT.",
            "Có nền tảng lập trình hướng đối tượng (OOP) vững với Java hoặc Python.",
            "Hiểu biết cơ bản về kiểm thử phần mềm (Testing Lifecycle, Test Case, Bug Report).",
            "Có tinh thần trách nhiệm, chủ động học hỏi và tư duy phản biện tốt.",
            "Ưu tiên sinh viên đã từng làm việc với Git, Postman hoặc hiểu về REST API."
        ],
        targetProgramCodes: ["SE", "IT", "CS"],
        targetLearningOutcomes: [
            "Làm chủ quy trình phát triển và kiểm thử phần mềm doanh nghiệp thực tế",
            "Kỹ năng xây dựng kịch bản kiểm thử tự động và tích hợp hệ thống CI/CD",
            "Tác phong làm việc nhóm chuyên nghiệp theo chuẩn Agile/Scrum"
        ],
        benefits: [
            "Mức phụ cấp thực tập: 4.500.000 - 6.500.000 VNĐ / tháng tùy theo kết quả đánh giá",
            "Được phân công cán bộ kỹ thuật (Mentor 1:1) hướng dẫn xuyên suốt kỳ thực tập",
            "Được hỗ trợ đầy đủ trang thiết bị làm việc hiện đại tại văn phòng Cần Thơ",
            "Cơ hội ký hợp đồng kỹ sư chính thức ngay sau khi kết thúc kỳ thực tập",
            "Được cấp dấu mộc và chứng nhận hoàn thành thực tập chuẩn Đại học Cần Thơ"
        ],
        skills: [
            { skillId: "SK-JAVA", skillName: "Java", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-GIT", skillName: "Git", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-CRITICAL-THINKING", skillName: "Tư duy phản biện", isRequired: true, minimumLevel: 3 },
            { skillId: "SK-REST-API", skillName: "REST API", isRequired: false, minimumLevel: 1 }
        ],
        createdAt: "2026-09-20"
    },
    {
        id: "77777777-7777-7777-7777-777777777777",
        companyId: "33333333-3333-3333-3333-333333333333",
        companyName: "FPT Software Cần Thơ",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
        companyScale: "1.000 - 4.999 nhân viên",
        companyIndustry: "Công nghệ thông tin & Phần mềm",
        companyWebsite: "https://fptsoftware.com",
        companyAddress: "Đường số 1, KDC Nam Long, Phường Hưng Thạnh, Quận Cái Răng, TP. Cần Thơ",
        termId: "55555555-5555-5555-5555-555555555555",
        termName: "Học kỳ 1 Năm học 2026 - 2027",
        title: "THỰC TẬP SINH JAVA BACKEND DEVELOPER (SPRING BOOT)",
        workFormat: "HYBRID",
        location: "Cần Thơ",
        vacancies: 4,
        stipendAmount: 5000000,
        deadline: "25/11/2026",
        applicantCount: 5,
        experienceLevel: "Sinh viên năm cuối",
        status: "APPROVED",
        description: "Tham gia phát triển các phân hệ Backend Microservices xử lý dữ liệu lớn. Thiết kế cơ sở dữ liệu quan hệ, tối ưu hóa truy vấn SQL, xây dựng RESTful API bảo mật với Spring Security & JWT.",
        requirements: [
            "Sinh viên chuyên ngành Kỹ thuật phần mềm hoặc Khoa học máy tính.",
            "Nắm vững kiến thức Java Core (Collections, Concurrency, Stream API).",
            "Đã từng làm đồ án sử dụng Spring Boot và cơ sở dữ liệu quan hệ (PostgreSQL / MySQL).",
            "Kỹ năng sử dụng Git thành thạo."
        ],
        targetProgramCodes: ["SE", "CS", "IT"],
        targetLearningOutcomes: [
            "Thực hành phát triển ứng dụng Microservices theo kiến trúc sạch (Clean Architecture)",
            "Kỹ năng tối ưu hóa hiệu năng truy vấn cơ sở dữ liệu quy mô lớn"
        ],
        benefits: [
            "Phụ cấp hỗ trợ hàng tháng: 5.000.000 VNĐ",
            "Tham gia các khóa đào tạo nội bộ do các chuyên gia công nghệ cao cấp giảng dạy",
            "Hỗ trợ số liệu và đề tài thực tập tốt nghiệp nếu sinh viên có nhu cầu"
        ],
        skills: [
            { skillId: "SK-JAVA", skillName: "Java", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-SPRING-BOOT", skillName: "Spring Boot", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-POSTGRESQL", skillName: "PostgreSQL", isRequired: false, minimumLevel: 2 }
        ],
        createdAt: "2026-09-22"
    },
    {
        id: "99999999-9999-9999-9999-999999999999",
        companyId: "44444444-4444-4444-4444-444444444444",
        companyName: "VNPT Cần Thơ - Trung tâm CNTT",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_VNPT.svg",
        companyScale: "500 - 1.000 nhân viên",
        companyIndustry: "Viễn thông & Giải pháp Số",
        companyWebsite: "https://vnptcantho.vn",
        companyAddress: "Số 02 Nguyễn Trãi, Phường Tân An, Quận Ninh Kiều, TP. Cần Thơ",
        termId: "55555555-5555-5555-5555-555555555555",
        termName: "Học kỳ 1 Năm học 2026 - 2027",
        title: "THỰC TẬP SINH LẬP TRÌNH FRONTEND (REACT / NEXT.JS)",
        workFormat: "HYBRID",
        location: "Cần Thơ",
        vacancies: 3,
        stipendAmount: 4500000,
        deadline: "15/11/2026",
        applicantCount: 3,
        experienceLevel: "Sinh viên năm 3 - 4",
        status: "APPROVED",
        description: "Tham gia lập trình giao diện người dùng cho các hệ thống cổng thông tin hành chính số và dịch vụ doanh nghiệp. Tối ưu trải nghiệm người dùng, xây dựng Responsive Mobile UI và kết nối các dịch vụ API hiện đại.",
        requirements: [
            "Nắm vững HTML5, CSS3, JavaScript (ES6+) và TypeScript.",
            "Có kinh nghiệm làm việc với React.js hoặc Next.js.",
            "Khả năng cắt giao diện chuẩn theo thiết kế Figma với Tailwind CSS.",
            "Tác phong làm việc chuẩn mực, bảo mật thông tin dự án."
        ],
        targetProgramCodes: ["SE", "IT"],
        targetLearningOutcomes: [
            "Kỹ năng xây dựng giao diện ứng dụng web quy mô lớn chuẩn doanh nghiệp",
            "Nắm vững kỹ thuật tương tác API và tối ưu hiệu năng frontend"
        ],
        benefits: [
            "Phụ cấp thực tập: 4.500.000 VNĐ / tháng",
            "Môi trường làm việc năng động tại trung tâm thành phố Cần Thơ",
            "Được tham gia các dự án chuyển đổi số trọng điểm của địa phương"
        ],
        skills: [
            { skillId: "SK-REACT", skillName: "React", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-REST-API", skillName: "RESTful API", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-GIT", skillName: "Git", isRequired: true, minimumLevel: 1 }
        ],
        createdAt: "2026-09-24"
    },
    {
        id: "a1b2c3d4-1111-2222-3333-444455556666",
        companyId: "a1b2c3d4-0000-0000-0000-111122223333",
        companyName: "LG CNS Việt Nam",
        companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_CNS_logo.svg",
        companyScale: "500 - 1.000 nhân viên",
        companyIndustry: "Giải pháp CNTT Toàn cầu",
        companyWebsite: "https://lgcns.com",
        companyAddress: "Tầng 15, Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh",
        termId: "55555555-5555-5555-5555-555555555555",
        termName: "Học kỳ 1 Năm học 2026 - 2027",
        title: "THỰC TẬP SINH KỸ SƯ DỮ LIỆU & CLOUD (DATA & DEVOPS)",
        workFormat: "REMOTE",
        location: "TP. Hồ Chí Minh",
        vacancies: 2,
        stipendAmount: 6000000,
        deadline: "30/11/2026",
        applicantCount: 1,
        experienceLevel: "Sinh viên năm cuối",
        status: "APPROVED",
        description: "Tham gia xây dựng luồng dữ liệu tự động (ETL Pipeline), quản trị cơ sở dữ liệu phân tán và triển khai ứng dụng trên nền tảng AWS / GCP.",
        requirements: [
            "Hiểu biết tốt về cơ sở dữ liệu quan hệ và NoSQL.",
            "Lập trình tốt với Python hoặc Java.",
            "Hiểu các khái niệm cơ bản về Docker, Containerization và Cloud Computing."
        ],
        targetProgramCodes: ["CS", "SE", "IT"],
        targetLearningOutcomes: [
            "Kỹ năng xử lý dữ liệu và thiết kế kiến trúc đám mây Cloud Native",
            "Môi trường làm việc đa quốc gia với đối tác Hàn Quốc"
        ],
        benefits: [
            "Mức phụ cấp hấp dẫn: 6.000.000 VNĐ / tháng",
            "Làm việc linh hoạt theo hình thức Remote kết hợp Onsite",
            "Hỗ trợ thi các chứng chỉ quốc tế AWS / Kubernetes"
        ],
        skills: [
            { skillId: "SK-PYTHON", skillName: "Python", isRequired: true, minimumLevel: 2 },
            { skillId: "SK-DOCKER", skillName: "Docker", isRequired: true, minimumLevel: 1 },
            { skillId: "SK-POSTGRESQL", skillName: "PostgreSQL", isRequired: true, minimumLevel: 2 }
        ],
        createdAt: "2026-09-25"
    }
];
