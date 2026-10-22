"""Generate a handwritten synthetic smoke dataset with lexical hashing vectors."""
import json
from pathlib import Path

from app.providers.local_hashing import LocalHashingBaselineProvider

DIM = 128
MODEL_NAME = "local-hashing-baseline-v1"
embedder = LocalHashingBaselineProvider(dimension=DIM, model_name=MODEL_NAME)


def make_embedding(text: str, task: str = "retrieval_document") -> list[float]:
    return embedder.embed(text, task=task)


SAMPLES = [
    {
        "domain": "Java Backend",
        "student": {
            "id": "std_java_01",
            "major": "Công nghệ thông tin",
            "skill_ids": ["Java", "Spring Boot", "PostgreSQL", "Docker", "Git"],
            "bio_summary": "Sinh viên năm cuối CNTT định hướng backend Java. Đã làm dự án microservices với Spring Boot, Hibernate, PostgreSQL và containerize bằng Docker.",
        },
        "jobs": [
            {
                "id": "job_java_spring_senior_intern",
                "title": "Thực tập sinh Java Spring Boot Backend",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Java", "Spring Boot", "PostgreSQL"],
                "optional_skill_ids": ["Docker", "Git", "Redis"],
                "description": "Tuyển dụng intern lập trình backend Java sử dụng framework Spring Boot, làm việc với database PostgreSQL và triển khai Docker.",
            },
            {
                "id": "job_java_core_intern",
                "title": "Java Software Engineer Intern",
                "target_major": "Kỹ thuật phần mềm",
                "mandatory_skill_ids": ["Java", "Git"],
                "optional_skill_ids": ["PostgreSQL", "Linux"],
                "description": "Phát triển các ứng dụng nội bộ nền tảng Java core, thiết kế cơ sở dữ liệu quan hệ và quản lý mã nguồn Git.",
            },
            {
                "id": "job_fullstack_java_react",
                "title": "Thực tập sinh Fullstack (Java + React)",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Java", "React"],
                "optional_skill_ids": ["Spring Boot", "TypeScript"],
                "description": "Tham gia dự án fullstack: backend API viết bằng Java Spring, frontend xây dựng bằng React và TypeScript.",
            },
            {
                "id": "job_dotnet_backend",
                "title": "Backend Intern .NET C#",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["C#", ".NET Core"],
                "optional_skill_ids": ["SQL Server", "Docker"],
                "description": "Xây dựng các RESTful API hiệu năng cao với C# .NET Core và SQL Server, tối ưu truy vấn dữ liệu.",
            },
            {
                "id": "job_frontend_vue",
                "title": "Frontend Developer Intern (Vue.js)",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Vue.js", "JavaScript", "HTML/CSS"],
                "optional_skill_ids": ["TailwindCSS"],
                "description": "Lập trình giao diện người dùng web ứng dụng Single Page Application bằng Vue 3 và Tailwind CSS.",
            },
            {
                "id": "job_qa_tester",
                "title": "Thực tập sinh Kiểm thử Phần mềm (Manual/Automation)",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Manual Testing", "Test Case"],
                "optional_skill_ids": ["Selenium", "Java"],
                "description": "Viết kịch bản kiểm thử test case, thực hiện kiểm thử chức năng và báo cáo lỗi phần mềm.",
            },
        ],
        "judgments": {
            "job_java_spring_senior_intern": 2,
            "job_java_core_intern": 2,
            "job_fullstack_java_react": 1,
            "job_qa_tester": 1,
            "job_dotnet_backend": 0,
            "job_frontend_vue": 0,
        },
    },
    {
        "domain": "Frontend React",
        "student": {
            "id": "std_fe_react_02",
            "major": "Kỹ thuật phần mềm",
            "skill_ids": ["React", "TypeScript", "Next.js", "TailwindCSS", "Git"],
            "bio_summary": "Front-end developer đam mê xây dựng web responsive, tối ưu UX/UI với ReactJS, TypeScript, Next.js và Tailwind CSS.",
        },
        "jobs": [
            {
                "id": "job_react_ts_intern",
                "title": "Thực tập sinh ReactJS / TypeScript Frontend",
                "target_major": "Kỹ thuật phần mềm",
                "mandatory_skill_ids": ["React", "TypeScript", "TailwindCSS"],
                "optional_skill_ids": ["Next.js", "Git"],
                "description": "Phát triển giao diện ứng dụng web hiện đại với React 18, TypeScript và Tailwind CSS, kết nối API backend RESTful.",
            },
            {
                "id": "job_nextjs_web_intern",
                "title": "Next.js Web Developer Intern",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Next.js", "React"],
                "optional_skill_ids": ["TypeScript", "GraphQL"],
                "description": "Xây dựng portal SSR/SSG sử dụng Next.js, tối ưu SEO và trải nghiệm người dùng trên thiết bị di động.",
            },
            {
                "id": "job_ui_ux_frontend",
                "title": "UI/UX & Frontend Collaborator",
                "target_major": "Thiết kế đồ họa / CNTT",
                "mandatory_skill_ids": ["Figma", "HTML/CSS", "JavaScript"],
                "optional_skill_ids": ["React"],
                "description": "Thiết kế wireframe UI trên Figma và chuyển giao giao diện HTML CSS sang React component.",
            },
            {
                "id": "job_mobile_flutter_cross",
                "title": "Flutter Mobile App Intern",
                "target_major": "Kỹ thuật phần mềm",
                "mandatory_skill_ids": ["Flutter", "Dart"],
                "optional_skill_ids": ["Firebase", "Git"],
                "description": "Phát triển ứng dụng di động đa nền tảng iOS & Android với Flutter framework và Firebase.",
            },
            {
                "id": "job_python_data_intern",
                "title": "Data Analyst / Python Intern",
                "target_major": "Khoa học dữ liệu",
                "mandatory_skill_ids": ["Python", "Pandas", "SQL"],
                "optional_skill_ids": ["PowerBI"],
                "description": "Thu thập, làm sạch và trực quan hóa dữ liệu kinh doanh bằng Python Pandas và PowerBI.",
            },
            {
                "id": "job_sysadmin_linux",
                "title": "System Administrator / NOC Intern",
                "target_major": "Mạng máy tính",
                "mandatory_skill_ids": ["Linux", "Networking"],
                "optional_skill_ids": ["Bash"],
                "description": "Quản trị máy chủ Linux, giám sát hạ tầng mạng và xử lý sự cố kết nối máy chủ.",
            },
        ],
        "judgments": {
            "job_react_ts_intern": 2,
            "job_nextjs_web_intern": 2,
            "job_ui_ux_frontend": 1,
            "job_mobile_flutter_cross": 0,
            "job_python_data_intern": 0,
            "job_sysadmin_linux": 0,
        },
    },
    {
        "domain": "Mobile Development",
        "student": {
            "id": "std_mobile_03",
            "major": "Khoa học máy tính",
            "skill_ids": ["Flutter", "Dart", "Firebase", "REST API", "Git"],
            "bio_summary": "Lập trình viên mobile Flutter. Có kinh nghiệm xây dựng ứng dụng di động hoàn chỉnh kết nối REST API, quản lý state BLoC và Firebase.",
        },
        "jobs": [
            {
                "id": "job_flutter_mobile_pro",
                "title": "Thực tập sinh Lập trình Di động Flutter",
                "target_major": "Khoa học máy tính",
                "mandatory_skill_ids": ["Flutter", "Dart"],
                "optional_skill_ids": ["Firebase", "REST API", "Git"],
                "description": "Xây dựng các tính năng mobile app thương mại điện tử bằng Flutter, tích hợp Firebase push notification và REST API.",
            },
            {
                "id": "job_react_native_intern",
                "title": "React Native Mobile Developer Intern",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["React Native", "JavaScript"],
                "optional_skill_ids": ["TypeScript", "REST API"],
                "description": "Phát triển ứng dụng mobile đa nền tảng React Native, trao đổi dữ liệu với backend qua JSON RESTful API.",
            },
            {
                "id": "job_android_native_kotlin",
                "title": "Native Android Intern (Kotlin)",
                "target_major": "Khoa học máy tính",
                "mandatory_skill_ids": ["Kotlin", "Android SDK"],
                "optional_skill_ids": ["Git", "Coroutines"],
                "description": "Lập trình ứng dụng Android native bằng ngôn ngữ Kotlin, Jetpack Compose và Retrofit.",
            },
            {
                "id": "job_php_backend_intern",
                "title": "PHP Laravel Developer Intern",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["PHP", "Laravel", "MySQL"],
                "optional_skill_ids": ["HTML/CSS"],
                "description": "Phát triển trang web thương mại điện tử sử dụng framework Laravel và cơ sở dữ liệu MySQL.",
            },
            {
                "id": "job_embedded_iot",
                "title": "IoT & Embedded Systems Intern",
                "target_major": "Kỹ thuật máy tính",
                "mandatory_skill_ids": ["C/C++", "Microcontroller", "ESP32"],
                "optional_skill_ids": ["MQTT"],
                "description": "Lập trình vi điều khiển ESP32 và cảm biến IoT truyền dữ liệu qua giao thức MQTT.",
            },
            {
                "id": "job_seo_content",
                "title": "Digital Marketing & Content Intern",
                "target_major": "Marketing",
                "mandatory_skill_ids": ["Content Writing", "SEO"],
                "optional_skill_ids": ["Canva"],
                "description": "Viết bài chuẩn SEO cho website công ty, thiết kế banner truyền thông trên mạng xã hội.",
            },
        ],
        "judgments": {
            "job_flutter_mobile_pro": 2,
            "job_react_native_intern": 1,
            "job_android_native_kotlin": 1,
            "job_php_backend_intern": 0,
            "job_embedded_iot": 0,
            "job_seo_content": 0,
        },
    },
    {
        "domain": "Data Science & AI",
        "student": {
            "id": "std_ai_ds_04",
            "major": "Khoa học dữ liệu / Trí tuệ nhân tạo",
            "skill_ids": ["Python", "PyTorch", "Pandas", "Scikit-learn", "SQL", "Git"],
            "bio_summary": "Sinh viên chuyên ngành Trí tuệ nhân tạo và Khoa học dữ liệu. Có thế mạnh về xử lý ngôn ngữ tự nhiên NLP, huấn luyện mô hình học máy với PyTorch và Scikit-learn.",
        },
        "jobs": [
            {
                "id": "job_ai_ml_intern",
                "title": "Thực tập sinh Trí tuệ nhân tạo & Machine Learning",
                "target_major": "Khoa học dữ liệu / Trí tuệ nhân tạo",
                "mandatory_skill_ids": ["Python", "PyTorch", "Scikit-learn"],
                "optional_skill_ids": ["Pandas", "SQL"],
                "description": "Tham gia nghiên cứu và triển khai mô hình học máy Machine Learning / Deep Learning, xử lý dữ liệu tabular và NLP.",
            },
            {
                "id": "job_data_engineer_intern",
                "title": "Data Engineer Intern",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Python", "SQL"],
                "optional_skill_ids": ["Pandas", "Docker", "Spark"],
                "description": "Xây dựng pipeline thu thập và chuyển đổi dữ liệu ETL, tối ưu truy vấn SQL trên cơ sở dữ liệu lớn.",
            },
            {
                "id": "job_bi_analyst_intern",
                "title": "Business Intelligence / Data Analyst Intern",
                "target_major": "Hệ thống thông tin quản lý",
                "mandatory_skill_ids": ["SQL", "PowerBI"],
                "optional_skill_ids": ["Python", "Excel"],
                "description": "Phân tích số liệu kinh doanh, xây dựng dashboard trực quan hóa trên PowerBI phục vụ báo cáo quản trị.",
            },
            {
                "id": "job_devops_cloud_intern",
                "title": "Cloud & DevOps Intern",
                "target_major": "Công nghệ thông tin",
                "mandatory_skill_ids": ["Docker", "Kubernetes", "Linux"],
                "optional_skill_ids": ["CI/CD"],
                "description": "Triển khai hạ tầng microservices trên cụm Kubernetes, cấu hình quy trình CI/CD tự động hóa.",
            },
            {
                "id": "job_game_unity_intern",
                "title": "Unity Game Developer Intern",
                "target_major": "Kỹ thuật phần mềm",
                "mandatory_skill_ids": ["Unity", "C#"],
                "optional_skill_ids": ["3D Modeling"],
                "description": "Lập trình gameplay và animation 2D/3D cho dự án game mobile trên engine Unity.",
            },
            {
                "id": "job_sales_it_intern",
                "title": "IT Sales & Presales Intern",
                "target_major": "Quản trị kinh doanh",
                "mandatory_skill_ids": ["Communication", "Negotiation"],
                "optional_skill_ids": ["English"],
                "description": "Tư vấn giải pháp phần mềm cho khách hàng doanh nghiệp, hỗ trợ làm hồ sơ thầu.",
            },
        ],
        "judgments": {
            "job_ai_ml_intern": 2,
            "job_data_engineer_intern": 2,
            "job_bi_analyst_intern": 1,
            "job_devops_cloud_intern": 0,
            "job_game_unity_intern": 0,
            "job_sales_it_intern": 0,
        },
    },
]


def build_dataset():
    dataset = {
        "split": "synthetic",
        "provenance": "Handwritten developer smoke fixture; not real students or independent expert labels.",
        "queries": [],
    }
    for item in SAMPLES:
        student = dict(item["student"])
        s_text = (student.get("bio_summary") or "") + " " + " ".join(student.get("skill_ids") or [])
        student["embedding"] = make_embedding(s_text, task="retrieval_query")
        student["embedding_model"] = MODEL_NAME

        jobs = []
        for j in item["jobs"]:
            job = dict(j)
            j_text = job["title"] + " " + (job.get("description") or "") + " " + " ".join(job.get("mandatory_skill_ids") or [])
            job["embedding"] = make_embedding(j_text, task="retrieval_document")
            job["embedding_model"] = MODEL_NAME
            jobs.append(job)

        dataset["queries"].append({
            "domain": item["domain"],
            "student": student,
            "jobs": jobs,
            "judgments": item["judgments"],
        })
    return dataset


if __name__ == "__main__":
    out_dir = Path("app/data")
    out_dir.mkdir(parents=True, exist_ok=True)
    data = build_dataset()
    target = out_dir / "internlink_benchmark.json"
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated benchmark dataset with {len(data['queries'])} queries at {target.resolve()}")
