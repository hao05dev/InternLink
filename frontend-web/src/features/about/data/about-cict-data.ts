import {
  DepartmentItem,
  EcosystemPillar,
  EcosystemStep,
  EnterprisePartner,
  MissionPillar,
  PartnerActivity,
  StatItem,
} from "../types/about.types";

export const ABOUT_STATS: StatItem[] = [
  {
    value: "30+",
    label: "Năm phát triển",
    description: "Tiền thân từ Khoa CNTT (1994), phát triển thành Trường CICT (2022).",
    iconName: "Calendar",
  },
  {
    value: "5.000+",
    label: "Sinh viên & Học viên",
    description: "Quy mô đào tạo nguồn nhân lực số chất lượng cao lớn nhất ĐBSCL.",
    iconName: "Users",
  },
  {
    value: "06",
    label: "Khoa chuyên môn",
    description: "Đào tạo chuyên sâu các chuyên ngành mũi nhọn từ phần mềm đến AI.",
    iconName: "Layers",
  },
  {
    value: "200+",
    label: "Doanh nghiệp hợp tác",
    description: "Mạng lưới đối tác công nghệ tiếp nhận thực tập và tuyển dụng.",
    iconName: "Building2",
  },
  {
    value: "AUN-QA",
    label: "Kiểm định quốc tế",
    description: "Nhiều chương trình đào tạo đạt chứng nhận chất lượng Đông Nam Á.",
    iconName: "Award",
  },
];

export const MISSION_PILLARS: MissionPillar[] = [
  {
    title: "Chất lượng đào tạo chuẩn quốc tế",
    subtitle: "AUN-QA Accredited Programs",
    description:
      "Chương trình đào tạo được cập nhật liên tục theo chuẩn công nghệ toàn cầu, chú trọng tư duy thuật toán, kiến trúc hệ thống và năng lực ngoại ngữ.",
    highlights: [
      "Kiểm định chuẩn quốc tế AUN-QA",
      "Đội ngũ 100+ giảng viên tu nghiệp nước ngoài",
      "Chương trình Tiên tiến & Chất lượng cao giảng dạy bằng tiếng Anh",
    ],
    iconName: "GraduationCap",
  },
  {
    title: "Mô hình thực tập thực chiến 3 bên",
    subtitle: "Tripartite Internship Model",
    description:
      "Cơ chế hợp tác gắn kết chặt chẽ giữa Nhà trường – Doanh nghiệp – Sinh viên qua nền tảng InternLink, đảm bảo thẩm định vị trí và công nhận tín chỉ minh bạch.",
    highlights: [
      "100% sinh viên thực tập tại doanh nghiệp thực tế",
      "Ký kết thỏa thuận thực tập 3 bên minh bạch",
      "Đánh giá năng lực theo chuẩn đầu ra (CLO / PLO)",
    ],
    iconName: "Handshake",
  },
  {
    title: "Nghiên cứu & Chuyển giao công nghệ",
    subtitle: "Applied R&D & Innovation",
    description:
      "Tiên phong trong các nghiên cứu ứng dụng Trí tuệ nhân tạo (AI), Khoa học dữ liệu, IoT và các giải pháp chuyển đổi số phục vụ kinh tế - xã hội Đồng bằng sông Cửu Long.",
    highlights: [
      "Hệ thống phòng Lab chuyên sâu & Không gian sáng chế (Makerspace)",
      "Nhiều công bố quốc tế uy tín thuộc danh mục ISI/Scopus",
      "Hợp tác R&D trực tiếp với doanh nghiệp công nghệ lớn",
    ],
    iconName: "Cpu",
  },
];

export const DEPARTMENTS: DepartmentItem[] = [
  {
    id: "se",
    name: "Khoa Công nghệ Phần mềm",
    englishName: "Department of Software Engineering",
    shortCode: "SE",
    iconName: "Code2",
    description:
      "Đào tạo kỹ sư phần mềm chuyên nghiệp, thành thạo các phương pháp phát triển phần mềm hiện đại, kiến trúc hệ thống lớn và quy trình DevOps.",
    majors: ["Kỹ thuật phần mềm (Đại trà & CLC)"],
    targetRoles: ["Software Engineer", "Fullstack Developer", "Mobile Developer", "QA/QC Engineer"],
    studentCount: "1.400+",
  },
  {
    id: "cs",
    name: "Khoa Khoa học Máy tính",
    englishName: "Department of Computer Science",
    shortCode: "CS",
    iconName: "BrainCircuit",
    description:
      "Tập trung nghiên cứu và đào tạo chuyên sâu về Trí tuệ nhân tạo (AI), Học máy (Machine Learning), Xử lý ngôn ngữ tự nhiên và Thị giác máy tính.",
    majors: ["Khoa học máy tính", "Trí tuệ nhân tạo ứng dụng"],
    targetRoles: ["AI/ML Engineer", "Data Scientist", "Research Assistant", "Algorithm Engineer"],
    studentCount: "850+",
  },
  {
    id: "is",
    name: "Khoa Hệ thống Thông tin",
    englishName: "Department of Information Systems",
    shortCode: "IS",
    iconName: "Database",
    description:
      "Đào tạo chuyên gia phân tích nghiệp vụ, thiết kế hệ thống dữ liệu doanh nghiệp, ERP, chuyển đổi số và khai phá dữ liệu lớn (Big Data).",
    majors: ["Hệ thống thông tin (Đại trà & CLC)"],
    targetRoles: ["Business Analyst (BA)", "Data Analyst", "ERP Consultant", "Product Owner"],
    studentCount: "950+",
  },
  {
    id: "net",
    name: "Khoa Mạng máy tính & Truyền thông",
    englishName: "Department of Computer Networks & Communications",
    shortCode: "NET",
    iconName: "Network",
    description:
      "Đào tạo kỹ sư chuyên sâu về hạ tầng mạng viễn thông, bảo mật hệ thống thông tin, an ninh mạng, điện toán đám mây và hệ thống IoT.",
    majors: ["Mạng máy tính & TTDL", "An toàn thông tin"],
    targetRoles: ["Cybersecurity Specialist", "DevOps/Cloud Engineer", "Network Administrator", "System Engineer"],
    studentCount: "900+",
  },
  {
    id: "mc",
    name: "Khoa Truyền thông Đa phương tiện",
    englishName: "Department of Multimedia Communications",
    shortCode: "MC",
    iconName: "Sparkles",
    description:
      "Kết hợp giữa công nghệ và sáng tạo nghệ thuật số: thiết kế giao diện/trải nghiệm người dùng (UI/UX), đồ họa tương tác 3D, game và nội dung số.",
    majors: ["Truyền thông đa phương tiện"],
    targetRoles: ["UI/UX Designer", "Product Designer", "Game Developer", "Digital Media Producer"],
    studentCount: "500+",
  },
  {
    id: "it",
    name: "Khoa Công nghệ Thông tin",
    englishName: "Department of Information Technology",
    shortCode: "IT",
    iconName: "Laptop",
    description:
      "Phụ trách chương trình Công nghệ thông tin toàn diện, chương trình đào tạo liên kết quốc tế và các học phần tin học ứng dụng nền tảng.",
    majors: ["Công nghệ thông tin (Tiên tiến & CLC)", "Tin học ứng dụng"],
    targetRoles: ["IT Specialist", "Solutions Architect", "Technical Support Specialist", "Web Developer"],
    studentCount: "600+",
  },
];

export const ECOSYSTEM_PILLARS: EcosystemPillar[] = [
  {
    role: "Nhà trường (CICT)",
    title: "Bảo trợ học thuật & Công nhận tín chỉ",
    description:
      "Thẩm định tiêu chuẩn vị trí thực tập, phân công Giảng viên hướng dẫn học thuật, đồng hành giám sát và nghiệm thu kết quả.",
    responsibilities: [
      "Kiểm định điều kiện tiếp nhận của doanh nghiệp",
      "Giảng viên hướng dẫn định kỳ trao đổi với Mentor",
      "Chấm điểm báo cáo và công nhận tín chỉ học phần",
    ],
    badge: "Bảo trợ chất lượng",
  },
  {
    role: "Doanh nghiệp tiếp nhận",
    title: "Môi trường thực chiến & Cố vấn kỹ thuật",
    description:
      "Tạo cơ hội tham gia trực tiếp dự án thực tế, phân công Mentor kèm cặp sát sao và đánh giá năng lực thực tế của sinh viên.",
    responsibilities: [
      "Phân công Mentor trực tiếp kèm cặp 1-on-1",
      "Giao công việc đúng chuyên môn thỏa thuận",
      "Đánh giá tiến độ hàng tuần và hoàn tất phiếu đánh giá",
    ],
    badge: "Thực chiến dự án",
  },
  {
    role: "Sinh viên thực tập",
    title: "Ứng dụng kiến thức & Tác phong làm việc",
    description:
      "Chủ động thích ứng với văn hóa doanh nghiệp, tuân thủ kỷ luật lao động, ghi nhận nhật ký hàng ngày và trau dồi kỹ năng chuyên môn.",
    responsibilities: [
      "Tuân thủ nghiêm ngặt nội quy và bảo mật thông tin",
      "Cập nhật nhật ký thực tập (Daily/Weekly log)",
      "Báo cáo tiến độ cho cả Mentor và Giảng viên",
    ],
    badge: "Chủ động phát triển",
  },
];

export const ECOSYSTEM_STEPS: EcosystemStep[] = [
  {
    step: 1,
    title: "Khớp nối vị trí",
    subtitle: "Ứng tuyển & Phê duyệt",
    description: "Sinh viên nộp hồ sơ vào các vị trí đã qua kiểm duyệt chuẩn đào tạo của CICT.",
  },
  {
    step: 2,
    title: "Thỏa thuận 3 bên",
    subtitle: "Learning Agreement",
    description: "Ký kết mục tiêu học tập, phạm vi công việc và chỉ tiêu đánh giá (CLO) rõ ràng.",
  },
  {
    step: 3,
    title: "Thực tập & Giám sát",
    subtitle: "Logs & Weekly Review",
    description: "Sinh viên cập nhật nhật ký thực tập; Mentor và Giảng viên theo dõi sát tiến độ.",
  },
  {
    step: 4,
    title: "Đánh giá & Nghiệm thu",
    subtitle: "Báo cáo cuối kỳ",
    description: "Doanh nghiệp chấm điểm kỹ năng thực tế, Nhà trường đánh giá và quy đổi tín chỉ.",
  },
];

export const PARTNER_ACTIVITIES: PartnerActivity[] = [
  {
    title: "Ngày hội việc làm CNTT (CICT IT Job Fair)",
    description:
      "Sự kiện thường niên quy tụ hơn 40 doanh nghiệp công nghệ trong nước và quốc tế, mang lại hàng trăm cơ hội việc làm và thực tập cho sinh viên.",
    frequency: "Thường niên (Tháng 4 - 5 hàng năm)",
    iconName: "Briefcase",
    badge: "Sự kiện trọng điểm",
  },
  {
    title: "Chuỗi hội thảo công nghệ (Tech Talks & Workshops)",
    description:
      "Các chuyên gia đầu ngành từ doanh nghiệp chia sẻ trực tiếp về các xu hướng công nghệ mới (GenAI, Cloud, Microservices, DevSecOps).",
    frequency: "Định kỳ hàng tháng",
    iconName: "Presentation",
    badge: "Nâng cao năng lực",
  },
  {
    title: "Học bổng đồng hành & Tài trợ Lab chuyên đề",
    description:
      "Doanh nghiệp tài trợ thiết bị nghiên cứu, phòng thí nghiệm chuyên đề và các suất học bổng khuyến học cho sinh viên xuất sắc.",
    frequency: "Theo năm học",
    iconName: "Gift",
    badge: "Ươm mầm tài năng",
  },
];

export const ENTERPRISE_PARTNERS: EnterprisePartner[] = [
  { name: "FPT Software", field: "Gia công phần mềm & AI", tier: "Chiến lược" },
  { name: "TMA Solutions", field: "Giải pháp phần mềm & IoT", tier: "Chiến lược" },
  { name: "Viettel Group", field: "Viễn thông & An ninh mạng", tier: "Chiến lược" },
  { name: "VNPT Cần Thơ", field: "Hạ tầng số & Giải pháp CNTT", tier: "Chiến lược" },
  { name: "NashTech", field: "Tư vấn công nghệ & Phát triển PM", tier: "Đối tác chính" },
  { name: "Axon Active", field: "Phát triển phần mềm Agile/Scrum", tier: "Đối tác chính" },
  { name: "Momo", field: "FinTech & Nền tảng thanh toán", tier: "Đối tác chính" },
  { name: "SmartDev", field: "Giải pháp phần mềm quốc tế", tier: "Đối tác chính" },
  { name: "Rikkei Digital", field: "Chuyển đổi số & AI Solutions", tier: "Đối tác chính" },
  { name: "Hekate", field: "AI Chatbot & Xử lý ngôn ngữ", tier: "Đối tác chính" },
];
