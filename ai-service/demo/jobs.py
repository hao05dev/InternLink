"""Curated demo vacancies. They are fixtures, not production records."""

DEMO_JOBS = [
    {
        "id": "demo-java-backend", "title": "Java Backend Intern", "company_name": "Mekong Software",
        "location": "Cần Thơ", "work_format": "ONSITE",
        "mandatory_skill_ids": ["SK-JAVA", "SK-SPRING-BOOT", "SK-SQL"],
        "optional_skill_ids": ["SK-DOCKER", "SK-GIT"],
        "description": "Phát triển REST API bằng Java, Spring Boot và SQL. Ưu tiên Docker, Git.",
    },
    {
        "id": "demo-frontend", "title": "Frontend React Intern", "company_name": "Lotus Digital",
        "location": "Hồ Chí Minh", "work_format": "HYBRID",
        "mandatory_skill_ids": ["SK-JS", "SK-REACT", "SK-HTML-CSS"],
        "optional_skill_ids": ["SK-GIT", "SK-NODEJS"],
        "description": "Xây dựng giao diện React, JavaScript, HTML/CSS. Ưu tiên Git và Node.js.",
    },
    {
        "id": "demo-python", "title": "Python Data Intern", "company_name": "Delta Analytics",
        "location": "Cần Thơ", "work_format": "HYBRID",
        "mandatory_skill_ids": ["SK-PYTHON", "SK-SQL"],
        "optional_skill_ids": ["SK-GIT", "SK-AWS"],
        "description": "Làm sạch dữ liệu và xây pipeline bằng Python, SQL. Ưu tiên Git, AWS.",
    },
    {
        "id": "demo-fullstack", "title": "Full-stack Intern", "company_name": "Campus Tech",
        "location": "Cần Thơ", "work_format": "ONSITE",
        "mandatory_skill_ids": ["SK-JAVA", "SK-SPRING-BOOT", "SK-REACT"],
        "optional_skill_ids": ["SK-SQL", "SK-DOCKER", "SK-GIT"],
        "description": "Phát triển web với Spring Boot và React; làm việc với SQL, Git và Docker.",
    },
    {
        "id": "demo-devops", "title": "Cloud & DevOps Intern", "company_name": "Nimbus Lab",
        "location": "Đà Nẵng", "work_format": "REMOTE",
        "mandatory_skill_ids": ["SK-DOCKER", "SK-GIT"],
        "optional_skill_ids": ["SK-AWS", "SK-PYTHON"],
        "description": "Hỗ trợ container, CI/CD và cloud. Bắt buộc Docker, Git; ưu tiên AWS, Python.",
    },
    {
        "id": "demo-mobile", "title": "React Native Intern", "company_name": "River Mobile",
        "location": "Hồ Chí Minh", "work_format": "ONSITE",
        "mandatory_skill_ids": ["SK-JS", "SK-REACT-NATIVE"],
        "optional_skill_ids": ["SK-REACT", "SK-GIT"],
        "description": "Phát triển ứng dụng di động React Native với JavaScript; ưu tiên React và Git.",
    },
]

SKILL_LABELS = {
    "SK-JAVA": "Java", "SK-PYTHON": "Python", "SK-JS": "JavaScript", "SK-SQL": "SQL",
    "SK-SPRING-BOOT": "Spring Boot", "SK-NODEJS": "Node.js", "SK-REACT": "React",
    "SK-HTML-CSS": "HTML/CSS", "SK-REACT-NATIVE": "React Native", "SK-DOCKER": "Docker",
    "SK-AWS": "AWS", "SK-GIT": "Git",
}


def labels(skill_ids):
    return [SKILL_LABELS.get(skill_id, skill_id) for skill_id in skill_ids]
