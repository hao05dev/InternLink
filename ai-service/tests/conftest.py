import socket

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    original_connect = socket.socket.connect
    original_create_connection = socket.create_connection

    def is_loopback(address):
        if isinstance(address, tuple) and address:
            host = str(address[0]).lower()
            return host in ("127.0.0.1", "::1", "localhost", "testserver")
        return False

    def local_connect(sock, address):
        if is_loopback(address):
            return original_connect(sock, address)
        raise AssertionError("Tests must not contact external services")

    def local_create_connection(address, *args, **kwargs):
        if is_loopback(address):
            return original_create_connection(address, *args, **kwargs)
        raise AssertionError("Tests must not contact external services")

    monkeypatch.setattr(socket, "create_connection", local_create_connection)
    monkeypatch.setattr(socket.socket, "connect", local_connect)


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
