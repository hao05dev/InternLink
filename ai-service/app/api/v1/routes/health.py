from fastapi import APIRouter

from app.api.dependencies import ServicesDep

router = APIRouter(tags=["Health"])


@router.get("/")
@router.get("/health/live")
def health(services: ServicesDep):
    settings = services.settings
    return {
        # Compatibility: Java currently interprets healthy as service reachability.
        "status": "healthy",
        "service": settings.APP_NAME,
        "gemini_api_configured": bool(settings.GEMINI_API_KEY.get_secret_value()),
        "extraction_model": settings.LLM_MODEL if settings.EXTRACTION_PROVIDER == "gemini" else "rule-based-extraction",
        "embedding_model": services.embeddings.provider.model_name if services.embeddings.provider else "disabled",
        "capabilities": {
            "extraction": settings.EXTRACTION_PROVIDER,
            "embedding": settings.EMBEDDING_PROVIDER,
            "ranking": "precomputed_vectors_or_skill_only",
            "provider_connectivity": "not_probed",
        },
        "taxonomy_version": services.taxonomy.version,
    }
