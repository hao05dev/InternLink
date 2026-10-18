"""Pure transformations from API payloads to compact UI rows."""
from demo.jobs import labels


STATUS_LABELS = {
    "mentioned": "Có minh chứng",
    "learning": "Đang học",
    "negated": "Đã phủ định",
}


def skill_review_rows(extraction: dict) -> list[dict]:
    rows = []
    for skill in extraction.get("normalized_skills", []):
        rows.append({
            "Skill ID": skill["id"],
            "Chọn": skill.get("assertion_status") == "mentioned",
            "Kỹ năng": skill["name"],
            "Đánh giá": STATUS_LABELS.get(skill.get("assertion_status"), "Chưa rõ"),
            "Dẫn chứng": skill.get("evidence", {}).get("quote", ""),
        })
    return rows


def ranking_rows(payload: dict, jobs: list[dict]) -> list[dict]:
    rankings = sorted(payload.get("rankings", []), key=lambda row: row["match_percentage"], reverse=True)
    return [{
        "#": index,
        "Vị trí": row["job_title"],
        "Công ty": row.get("company_name") or "—",
        "Phù hợp": row["match_percentage"] if row["score_available"] else None,
        "Đã khớp": ", ".join(labels(row["matched_skills"])) or "—",
        "Thiếu bắt buộc": ", ".join(labels(row["missing_skills"])) or "—",
        "Thiếu ưu tiên": ", ".join(labels(optional_missing(row, jobs))) or "—",
    } for index, row in enumerate(rankings, 1)]


def optional_missing(ranking: dict, jobs: list[dict]) -> list[str]:
    job = next((job for job in jobs if job["id"] == ranking["job_id"]), None)
    if job is None:
        return []
    matched = set(ranking.get("matched_skills", []))
    return [skill_id for skill_id in job["optional_skill_ids"] if skill_id not in matched]


def job_rows(jobs: list[dict]) -> list[dict]:
    return [{
        "Vị trí": job["title"],
        "Công ty": job["company_name"],
        "Địa điểm": job["location"],
        "Hình thức": job["work_format"].title(),
        "Số lượng": job.get("vacancies", "—"),
        "Hạn nộp": (job.get("application_deadline") or "Không giới hạn")[:10],
        "Bắt buộc": ", ".join(labels(job["mandatory_skill_ids"])),
        "Ưu tiên": ", ".join(labels(job["optional_skill_ids"])),
    } for job in jobs]
