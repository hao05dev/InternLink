from app.core.errors import ProviderUnavailable
from app.schemas.skills import RawExtraction, RawSkillMention
from app.services.skill_service import SkillService


def test_punctuation_skills_and_java_javascript_boundaries(application):
    result = application.state.services.skills.extract_skills_from_text("C++, C#; JavaScript")
    ids = {skill.id for skill in result.normalized_skills}
    assert {"SK-CPP", "SK-CSHARP", "SK-JS"} <= ids
    assert "SK-JAVA" not in ids


def test_negation_is_visible_and_never_auto_confirmed(application):
    result = application.state.services.skills.extract_skills_from_text("Tôi chưa biết Docker, muốn học Docker.")
    docker = next(skill for skill in result.normalized_skills if skill.id == "SK-DOCKER")
    assert "chưa biết" in docker.evidence.quote
    assert docker.assertion_status == "negated"
    assert docker.requires_confirmation


def test_short_names_are_not_fuzzy_matched(application):
    assert application.state.services.taxonomy.normalize("xx") is None


def test_provider_failure_uses_rule_based_with_reason(application):
    class BrokenProvider:
        model_name = "test-model"
        def extract(self, text):
            raise ProviderUnavailable("extraction_provider_failed")
    service = SkillService(application.state.services.taxonomy, BrokenProvider())
    result = service.extract_skills_from_text("Java", allow_cloud=True)
    assert result.mode == "rule_based"
    assert "extraction_provider_failed" in result.warnings
    assert result.normalized_skills[0].id == "SK-JAVA"


def test_fabricated_quotes_and_unsupported_skills_are_discarded(application):
    class HallucinatingProvider:
        model_name = "test-model"
        def extract(self, text):
            return RawExtraction(mentions=[
                RawSkillMention(name="Java", quote="nonexistent quote"),
                RawSkillMention(name="Docker", quote="I use Java."),
                RawSkillMention(name="Java", quote="I use Java."),
            ])
    service = SkillService(application.state.services.taxonomy, HallucinatingProvider())
    result = service.extract_skills_from_text("I use Java.", allow_cloud=True)
    assert [skill.id for skill in result.normalized_skills] == ["SK-JAVA"]
    assert "unsupported_quote_discarded" in result.warnings
    assert "unsupported_skill_discarded" in result.warnings
