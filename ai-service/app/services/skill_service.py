from app.core.errors import ProviderUnavailable
from app.providers.base import SkillExtractionProvider
from app.schemas.skills import ExtractedSkill, ExtractSkillResponse, SkillEvidence
from app.services.taxonomy_service import TaxonomyService
from app.services.assertion_service import classify_assertion, classify_requirement


class SkillService:
    def __init__(self, taxonomy: TaxonomyService, provider: SkillExtractionProvider | None = None):
        self.taxonomy = taxonomy
        self.provider = provider

    def extract_skills_from_text(self, text: str, source_type="cv", allow_cloud=False) -> ExtractSkillResponse:
        warnings = ["mentions_require_review; assertion_uses_lexical_cues; proficiency_not_verified"]
        mode, model = "rule_based", "rule-based-extraction"
        prompt_version = None
        candidates = []
        unmatched = []
        if self.provider and allow_cloud:
            try:
                raw = self.provider.extract(text)
                mode, model, prompt_version = "gemini", self.provider.model_name, "skills-v1"
                for mention in raw.mentions:
                    start = text.find(mention.quote)
                    skill = self.taxonomy.normalize(mention.name)
                    if start < 0:
                        warnings.append("unsupported_quote_discarded")
                        continue
                    supported = {s.id for s, _ in self.taxonomy.mentions(mention.quote)}
                    if skill is None:
                        if mention.name.casefold() in mention.quote.casefold():
                            unmatched.append(mention.name)
                        continue
                    if skill.id not in supported:
                        warnings.append("unsupported_skill_discarded")
                        continue
                    for found, match in self.taxonomy.mentions(mention.quote):
                        if found.id == skill.id:
                            candidates.append((skill, mention.name, start + match.start(), start + match.end()))
            except ProviderUnavailable as error:
                warnings.append(error.code)
        if mode == "rule_based":
            candidates = [
                (s, m.group(), m.start(), m.end())
                for s, m in self.taxonomy.mentions(text)
            ]
        # Prefer an explicit positive mention over an earlier negated occurrence.
        candidates.sort(key=lambda item: (classify_assertion(text, item[2], item[3]) != "mentioned", item[2]))
        seen, normalized = set(), []
        for skill, mention, start, end in candidates:
            if skill.id in seen:
                continue
            seen.add(skill.id)
            normalized.append(ExtractedSkill(
                id=skill.id, name=skill.name, category=skill.category, raw_mention=mention,
                evidence=SkillEvidence(quote=text[max(0, start - 80):min(len(text), end + 80)],
                                       start=max(0, start - 80), end=min(len(text), end + 80)),
                assertion_status=classify_assertion(text, start, end),
                requirement_type=classify_requirement(text, start) if source_type == "jd" else "unspecified",
            ))
        normalized.sort(key=lambda item: (item.evidence.start, item.id))
        unmatched = sorted(set(unmatched))
        return ExtractSkillResponse(
            model=model, mode=mode, prompt_version=prompt_version,
            taxonomy_version=self.taxonomy.version,
            total_extracted=len(normalized) + len(unmatched),
            normalized_skills=normalized, unmatched_skills=unmatched,
            warnings=sorted(set(warnings)),
        )
