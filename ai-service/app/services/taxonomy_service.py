import json
import re
from pathlib import Path

from pydantic import TypeAdapter
from rapidfuzz import fuzz, process

from app.schemas.skills import TaxonomySkill


class TaxonomyService:
    def __init__(self, path: Path, version: str):
        self.version = version
        self.skills = TypeAdapter(list[TaxonomySkill]).validate_python(json.loads(path.read_text(encoding="utf-8")))
        if not self.skills or len({s.id for s in self.skills}) != len(self.skills):
            raise ValueError("Taxonomy must contain unique skill IDs")
        self.aliases: dict[str, TaxonomySkill] = {}
        for skill in self.skills:
            for alias in [skill.name, *skill.synonyms]:
                key = alias.strip().lower()
                if not key:
                    raise ValueError("Taxonomy aliases cannot be empty")
                if key in self.aliases and self.aliases[key].id != skill.id:
                    raise ValueError(f"Ambiguous taxonomy alias: {key}")
                self.aliases[key] = skill

    def normalize(self, name: str) -> TaxonomySkill | None:
        query = name.strip().lower()
        if query in self.aliases:
            return self.aliases[query]
        if len(query) < 5:
            return None
        match = process.extractOne(query, self.aliases.keys(), scorer=fuzz.ratio, score_cutoff=90)
        return self.aliases[match[0]] if match else None

    def mentions(self, text: str):
        for alias in sorted(self.aliases, key=lambda item: (-len(item), item)):
            # Word boundaries alone fail for C++ and C#.
            pattern = r"(?<![\w+#])" + re.escape(alias) + r"(?![\w+#])"
            for match in re.finditer(pattern, text, flags=re.IGNORECASE):
                yield self.aliases[alias], match
