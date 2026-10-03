"""ASGI entrypoint and composition root."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.dependencies import build_services
from app.api.v1.routes import assistance, health, matching, skills
from app.core.config import Settings
from app.core.errors import ProviderUnavailable


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings if settings is not None else Settings()
    application = FastAPI(
        title=config.APP_NAME, version="1.1.0",
        description="InternLink: extraction, normalization and explainable matching.",
    )
    application.state.services = build_services(config)
    if config.SERVICE_API_KEY.get_secret_value():
        import secrets

        @application.middleware("http")
        async def service_auth(request: Request, call_next):
            if request.url.path not in ("/", "/health/live") and not secrets.compare_digest(
                request.headers.get("X-InternLink-AI-Key", ""), config.SERVICE_API_KEY.get_secret_value()
            ):
                return JSONResponse(status_code=401, content={"detail": "service_auth_required"})
            return await call_next(request)
    if config.CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware, allow_origins=config.CORS_ORIGINS,
            allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["Content-Type"],
        )

    @application.exception_handler(ProviderUnavailable)
    async def provider_error(request: Request, error: ProviderUnavailable):
        return JSONResponse(status_code=503, content={"detail": {"code": error.code}})

    @application.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError):
        # Do not echo CV content or supplied vectors into errors and client logs.
        return JSONResponse(status_code=422, content={"detail": [
            {"loc": list(item["loc"]), "type": item["type"], "msg": item["msg"]}
            for item in error.errors()
        ]})

    application.include_router(health.router)
    application.include_router(skills.router)
    application.include_router(matching.router)
    application.include_router(assistance.router)
    if config.ENABLE_SAMPLE_BENCHMARK:
        from app.api.v1.routes.benchmarks import router
        application.include_router(router)
    return application


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=app.state.services.settings.PORT)
