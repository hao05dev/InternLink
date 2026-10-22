import json
import re
from pathlib import Path

from app.core.config import Settings
from app.services.taxonomy_service import TaxonomyService


SERVICE_ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = SERVICE_ROOT.parent
TAXONOMY_RELEASE = "internlink-it-v2"


def test_taxonomy_release_matches_backend_migration():
    taxonomy_path = SERVICE_ROOT / "app/data/esco_it_skills.json"
    migration_path = (
        REPOSITORY_ROOT
        / "backend-core/src/main/resources/db/migration/V32__govern_ai_skill_taxonomy.sql"
    )
    taxonomy = json.loads(taxonomy_path.read_text(encoding="utf-8"))
    migration = migration_path.read_text(encoding="utf-8")
    row_pattern = re.compile(
        r"\('(?P<id>SK-[A-Z0-9-]+)', '(?P<name>[^']+)', '[A-Z_]+', "
        r"'INTERNLINK', '(?P<aliases>\[[^']*\])'::jsonb, 'internlink-it-v2'"
    )
    migration_rows = {
        match["id"]: {
            "name": match["name"],
            "synonyms": json.loads(match["aliases"]),
        }
        for match in row_pattern.finditer(migration)
    }
    taxonomy_rows = {
        item["id"]: {"name": item["name"], "synonyms": item["synonyms"]}
        for item in taxonomy
    }

    assert taxonomy_rows == migration_rows
    assert Settings(_env_file=None).TAXONOMY_VERSION == TAXONOMY_RELEASE
    assert TAXONOMY_RELEASE in migration


def test_taxonomy_release_has_unique_ids_and_aliases():
    settings = Settings(_env_file=None)
    service = TaxonomyService(settings.TAXONOMY_PATH, settings.TAXONOMY_VERSION)

    assert len(service.skills) == 51
    assert len({skill.id for skill in service.skills}) == 51
