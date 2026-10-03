from app.schemas.assistance import (
    Issue, JobReviewResponse, JournalClaim, JournalSummaryResponse,
    LearningPlanResponse, LearningTask,
)
from app.services.assertion_service import classify_assertion


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
