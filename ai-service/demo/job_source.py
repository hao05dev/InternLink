"""Read quality-approved vacancies from PostgreSQL for the standalone demo."""
from dataclasses import dataclass
from html import unescape
from pathlib import Path
import re

from dotenv import dotenv_values
from psycopg import connect
from psycopg.rows import dict_row

from demo.jobs import DEMO_JOBS


SERVICE_ROOT = Path(__file__).resolve().parents[1]

QUALITY_JOBS_SQL = """
SELECT j.id::text, j.title, c.company_name, j.location, j.work_format,
       j.vacancies, j.description, j.application_deadline,
       array_agg(js.skill_id ORDER BY js.skill_id)
           FILTER (WHERE js.requirement_type = 'MANDATORY') AS mandatory_skill_ids,
       array_agg(js.skill_id ORDER BY js.skill_id)
           FILTER (WHERE js.requirement_type = 'OPTIONAL') AS optional_skill_ids
FROM job_positions j
JOIN companies c ON c.id = j.company_id
JOIN job_skills js ON js.job_id = j.id
WHERE j.status = 'APPROVED'
  AND c.verification_status = 'VERIFIED'
  AND length(trim(j.description)) >= 120
  AND (j.application_deadline IS NULL OR j.application_deadline >= NOW())
GROUP BY j.id, c.company_name
HAVING count(js.skill_id) >= 2
ORDER BY length(j.description) DESC, count(js.skill_id) DESC, j.approved_at DESC
LIMIT 12
"""

EXPIRED_QUALITY_COUNT_SQL = """
SELECT count(*) FROM (
  SELECT j.id
  FROM job_positions j
  JOIN companies c ON c.id = j.company_id
  JOIN job_skills js ON js.job_id = j.id
  WHERE j.status = 'APPROVED' AND c.verification_status = 'VERIFIED'
    AND length(trim(j.description)) >= 120
    AND j.application_deadline < NOW()
  GROUP BY j.id HAVING count(js.skill_id) >= 2
) expired
"""


@dataclass(frozen=True)
class JobLoadResult:
    jobs: list[dict]
    source: str
    expired_excluded: int = 0
    warning: str | None = None


def load_quality_jobs() -> JobLoadResult:
    try:
        settings = _database_settings()
        with connect(**settings, row_factory=dict_row) as connection:
            connection.execute("SET TRANSACTION READ ONLY")
            rows = connection.execute(QUALITY_JOBS_SQL).fetchall()
            expired = connection.execute(EXPIRED_QUALITY_COUNT_SQL).fetchone()["count"]
        return JobLoadResult([_to_demo_job(row) for row in rows], "PostgreSQL InternLink", expired)
    except Exception as error:
        return JobLoadResult(
            DEMO_JOBS, "Fixture dự phòng", warning=f"Không đọc được PostgreSQL: {type(error).__name__}",
        )


def _database_settings() -> dict:
    values = dotenv_values(SERVICE_ROOT.parent / "backend-core" / ".env")
    return {
        "host": values.get("DB_HOST", "localhost"),
        "port": int(values.get("DB_PORT", "5432")),
        "dbname": values.get("DB_NAME", "internlink_db"),
        "user": values.get("DB_USER"),
        "password": values.get("DB_PASSWORD"),
        "connect_timeout": 3,
    }


def _to_demo_job(row: dict) -> dict:
    return {
        "id": row["id"],
        "title": re.sub(r"(?i)thực tập sinh\s+thực tập sinh", "Thực tập sinh", row["title"]),
        "company_name": row["company_name"],
        "location": row["location"],
        "work_format": row["work_format"],
        "vacancies": row["vacancies"],
        "application_deadline": row["application_deadline"].isoformat() if row["application_deadline"] else None,
        "mandatory_skill_ids": row["mandatory_skill_ids"] or [],
        "optional_skill_ids": row["optional_skill_ids"] or [],
        "description": _strip_html(row["description"]),
    }


def _strip_html(value: str) -> str:
    spaced = re.sub(r"</?(?:p|li|ul|ol|h[1-6]|br)[^>]*>", " ", value, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", spaced))).strip()
