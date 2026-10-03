import socket

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    original_connect = socket.socket.connect

    def blocked(*args, **kwargs):
        raise AssertionError("Tests must not contact external services")

    def local_only(sock, address):
        # Windows asyncio uses a loopback socket pair for its own wake-up pipe.
        if isinstance(address, tuple) and address[0] in ("127.0.0.1", "::1"):
            return original_connect(sock, address)
        return blocked()

    monkeypatch.setattr(socket, "create_connection", blocked)
    monkeypatch.setattr(socket.socket, "connect", local_only)


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


@pytest.fixture
def client(application):
    with TestClient(application) as test_client:
        yield test_client
