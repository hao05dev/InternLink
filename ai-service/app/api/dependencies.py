from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Request

from app.core.config import Settings
from app.providers.gemini import GeminiEmbeddingProvider, GeminiSkillExtractionProvider
from app.providers.local_e5 import LocalE5Provider
from app.services.embedding_service import EmbeddingService
from app.services.matching_service import MatchingService
from app.services.ranking_service import RankingService
from app.services.skill_service import SkillService
from app.services.taxonomy_service import TaxonomyService


@dataclass(frozen=True)
class Services:
    settings: Settings
    taxonomy: TaxonomyService
    skills: SkillService
    embeddings: EmbeddingService
    matching: MatchingService


def build_services(settings: Settings) -> Services:
    taxonomy = TaxonomyService(settings.TAXONOMY_PATH, settings.TAXONOMY_VERSION)
    extraction = GeminiSkillExtractionProvider(settings) if settings.EXTRACTION_PROVIDER == "gemini" else None
    embedding = GeminiEmbeddingProvider(settings) if settings.EMBEDDING_PROVIDER == "gemini" else None
    if settings.EMBEDDING_PROVIDER == "local_e5":
        embedding = LocalE5Provider(settings.LOCAL_MODEL_PATH, settings.LOCAL_MODEL_REVISION)
    return Services(
        settings=settings, taxonomy=taxonomy,
        skills=SkillService(taxonomy, extraction),
        embeddings=EmbeddingService(embedding, settings.EMBEDDING_DIMENSION),
        matching=MatchingService(RankingService()),
    )


def get_services(request: Request) -> Services:
    return request.app.state.services


ServicesDep = Annotated[Services, Depends(get_services)]
