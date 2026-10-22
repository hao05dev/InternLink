import asyncio

import httpx2
import pytest

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def config():
    return Settings(
        _env_file=None, EXTRACTION_PROVIDER="rules", EMBEDDING_PROVIDER="disabled",
        GEMINI_API_KEY="", LLM_MODEL="", EMBEDDING_MODEL="", ENABLE_SAMPLE_BENCHMARK=False,
        CORS_ORIGINS=[],
    )


@pytest.fixture
def application(config):
    return create_app(config)


def make_in_process_client(application):
    """Use Starlette's supported httpx2 ASGI transport without local sockets."""
    class InProcessClient:
        def request(self, method, url, **kwargs):
            async def send():
                transport = httpx2.ASGITransport(app=application)
                async with httpx2.AsyncClient(
                    transport=transport, base_url="http://testserver"
                ) as session:
                    return await session.request(method, url, **kwargs)

            return asyncio.run(send())

        def get(self, url, **kwargs):
            return self.request("GET", url, **kwargs)

        def post(self, url, **kwargs):
            return self.request("POST", url, **kwargs)

    return InProcessClient()


@pytest.fixture
def client(application):
    return make_in_process_client(application)
