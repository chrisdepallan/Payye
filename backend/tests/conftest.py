import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture(autouse=True)
def _force_offline(monkeypatch):
    # Deterministic tests: force the heuristic fallbacks and disable guards.
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)
    monkeypatch.setattr(settings, "APP_TOKEN", None)
    monkeypatch.setattr(settings, "RATE_LIMIT_PER_MINUTE", 0)


@pytest.fixture
def client():
    return TestClient(app)
