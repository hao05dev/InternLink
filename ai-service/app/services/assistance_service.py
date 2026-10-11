from app.schemas.assistance import (
    Issue, JobReviewResponse, JournalClaim, JournalSummaryResponse,
    LearningPlanResponse, LearningTask, QueryParseRequest, QueryParseResponse,
)
from app.services.assertion_service import classify_assertion
import re


LOCATIONS_MAP = {
    "cần thơ": "Cần Thơ", "can tho": "Cần Thơ",
    "hồ chí minh": "Hồ Chí Minh", "tp.hcm": "Hồ Chí Minh", "tphcm": "Hồ Chí Minh", "sài gòn": "Hồ Chí Minh", "hcm": "Hồ Chí Minh",
    "hà nội": "Hà Nội", "ha noi": "Hà Nội",
    "đà nẵng": "Đà Nẵng", "da nang": "Đà Nẵng",
    "bình dương": "Bình Dương", "binh duong": "Bình Dương",
    "đồng nai": "Đồng Nai", "dong nai": "Đồng Nai",
    "hậu giang": "Hậu Giang", "hau giang": "Hậu Giang",
    "vĩnh long": "Vĩnh Long", "vinh long": "Vĩnh Long",
    "an giang": "An Giang",
    "tiền giang": "Tiền Giang", "tien giang": "Tiền Giang",
    "kiên giang": "Kiên Giang", "kien giang": "Kiên Giang",
    "đồng tháp": "Đồng Tháp", "dong thap": "Đồng Tháp",
    "bến tre": "Bến Tre", "ben tre": "Bến Tre",
    "long an": "Long An",
    "trà vinh": "Trà Vinh", "tra vinh": "Trà Vinh",
    "sóc trăng": "Sóc Trăng", "soc trang": "Sóc Trăng",
    "bạc liêu": "Bạc Liêu", "bac lieu": "Bạc Liêu",
    "cà mau": "Cà Mau", "ca mau": "Cà Mau",
}

ROLES_MAP = {
    "thực tập sinh": "INTERN", "thực tập": "INTERN", "intern": "INTERN",
    "fresher": "FRESHER", "junior": "JUNIOR", "trainee": "INTERN",
}

WORK_FORMATS_MAP = {
    "từ xa": "REMOTE", "remote": "REMOTE",
    "linh hoạt": "HYBRID", "hybrid": "HYBRID",
    "trực tiếp": "ONSITE", "onsite": "ONSITE", "tại văn phòng": "ONSITE",
}

INDUSTRIES_MAP = {
    "ngân hàng": "Ngân hàng", "bank": "Ngân hàng", "banking": "Ngân hàng",
    "fintech": "Fintech / Tài chính", "tài chính": "Fintech / Tài chính",
    "thương mại điện tử": "Thương mại điện tử", "e-commerce": "Thương mại điện tử", "ecommerce": "Thương mại điện tử",
    "y tế": "Y tế / Healthcare", "healthcare": "Y tế / Healthcare",
    "giáo dục": "Giáo dục / Edtech", "edtech": "Giáo dục / Edtech",
    "bảo hiểm": "Bảo hiểm", "logistics": "Logistics",
}

STOPWORDS = {
    "tại", "ở", "các", "những", "cho", "và", "là", "tìm", "kiếm",
    "việc", "vị", "trí", "tuyển", "dụng", "của", "trong", "về", "cần", "muốn",
}


class AssistanceService:
    def __init__(self, taxonomy):
        self.taxonomy = taxonomy

    def review_job(self, request):
        issues = []
        if not request.learning_outcomes:
            issues.append(Issue(code="missing_learning_outcomes", field="learning_outcomes",
                                message="Bổ sung mục tiêu học tập hoặc chuẩn đầu ra dự kiến."))
        if not request.location.strip():
            issues.append(Issue(code="missing_location", field="location", message="Bổ sung địa điểm thực tập."))
        if not request.work_format.strip():
            issues.append(Issue(code="missing_work_format", field="work_format", message="Bổ sung hình thức làm việc."))
        for phrase in ("mọi công việc", "các việc khác theo yêu cầu"):
            start = request.description.casefold().find(phrase)
            if start >= 0:
                issues.append(Issue(code="vague_tasks", field="description",
                                    quote=request.description[start:start + len(phrase)],
                                    message="Làm rõ phạm vi nhiệm vụ và sản phẩm sinh viên cần hoàn thành."))
        return JobReviewResponse(issues=issues)

    def summarize_journals(self, request):
        claims = []
        for entry in request.entries:
            seen = set()
            for skill, mention in self.taxonomy.mentions(entry.text):
                if skill.id in seen or classify_assertion(entry.text, mention.start(), mention.end()) != "mentioned":
                    continue
                seen.add(skill.id)
                start, end = max(0, mention.start() - 80), min(len(entry.text), mention.end() + 80)
                claims.append(JournalClaim(skill_id=skill.id, skill_name=skill.name, entry_id=entry.id,
                    source_version=entry.version, quote=entry.text[start:end], verification=entry.verification))
        return JournalSummaryResponse(claims=claims, entry_count=len(request.entries))

    def learning_plan(self, request):
        skills = {skill.id: skill for skill in self.taxonomy.skills}
        if any(id not in skills for id in request.skill_ids):
            raise ValueError("unknown_skill")
        unique_ids = list(dict.fromkeys(request.skill_ids))
        hours = round(request.hours_per_week / len(unique_ids), 2)
        return LearningPlanResponse(tasks=[
            LearningTask(skill_id=id, skill_name=skills[id].name,
                objective=f"Bổ sung minh chứng cho {skills[id].name}.",
                task=f"Trao đổi với mentor để chọn một bài tập nhỏ áp dụng {skills[id].name}, thực hiện và ghi lại kết quả.",
                evidence="Sản phẩm hoặc báo cáo ngắn kèm giải thích phần tự thực hiện.",
                review_criterion="Người hướng dẫn kiểm tra sản phẩm và yêu cầu giải thích quyết định thực hiện.",
                estimated_hours=hours if index < len(unique_ids) - 1 else round(request.hours_per_week - hours * index, 2))
            for index, id in enumerate(unique_ids)
        ])

    def parse_query(self, request: QueryParseRequest) -> QueryParseResponse:
        raw = request.query.strip()
        lower = raw.casefold()

        # 1. Trích xuất kỹ năng từ Taxonomy
        detected_skills = []
        for skill, _ in self.taxonomy.mentions(raw):
            if skill.name not in detected_skills:
                detected_skills.append(skill.name)

        # 2. Trích xuất Địa điểm
        detected_loc = None
        for key, canonical in LOCATIONS_MAP.items():
            if re.search(rf"\b{re.escape(key)}\b", lower):
                detected_loc = canonical
                break

        # 3. Trích xuất Cấp độ vị trí
        detected_role = None
        for key, role_val in ROLES_MAP.items():
            if re.search(rf"\b{re.escape(key)}\b", lower):
                detected_role = role_val
                break

        # 4. Trích xuất Hình thức làm việc
        detected_work_format = None
        for key, fmt_val in WORK_FORMATS_MAP.items():
            if re.search(rf"\b{re.escape(key)}\b", lower):
                detected_work_format = fmt_val
                break

        # 5. Trích xuất Khối ngành
        detected_industry = None
        for key, ind_val in INDUSTRIES_MAP.items():
            if re.search(rf"\b{re.escape(key)}\b", lower):
                detected_industry = ind_val
                break

        # 6. Yêu cầu phụ cấp / lương
        requires_stipend = None
        if any(w in lower for w in ("phụ cấp", "lương", "stipend")):
            requires_stipend = True

        # 7. Lọc sạch từ khóa tìm kiếm (bỏ stopwords & slot values)
        tokens = [t for t in re.split(r"\s+", lower) if t and t not in STOPWORDS]
        cleaned_keywords = " ".join(detected_skills) if detected_skills else " ".join(tokens)

        # 8. Sinh tóm tắt ý định tìm kiếm
        summary_parts = []
        if detected_role:
            summary_parts.append(f"Vị trí: {detected_role}")
        if detected_skills:
            summary_parts.append(f"Kỹ năng: {', '.join(detected_skills)}")
        if detected_loc:
            summary_parts.append(f"Địa điểm: {detected_loc}")
        if detected_industry:
            summary_parts.append(f"Khối ngành: {detected_industry}")
        if detected_work_format:
            summary_parts.append(f"Hình thức: {detected_work_format}")
        if requires_stipend:
            summary_parts.append("Có hỗ trợ phụ cấp")

        summary_message = " | ".join(summary_parts) if summary_parts else f"Tìm kiếm tự do: {raw}"

        return QueryParseResponse(
            raw_query=raw,
            extracted_skills=detected_skills,
            suggested_role_level=detected_role,
            suggested_location=detected_loc,
            suggested_industry=detected_industry,
            suggested_work_format=detected_work_format,
            requires_stipend=requires_stipend,
            cleaned_keywords=cleaned_keywords,
            summary_message=summary_message,
        )

