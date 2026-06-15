"""Application configuration loaded from environment / .env file.

This backend is stateless — no database, no user data. It exists to keep the
OpenAI key server-side and turn text into AI responses.
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- App ---
    APP_NAME: str = "Payye AI"
    DEBUG: bool = True

    # --- CORS ---
    CORS_ORIGINS: List[str] = ["*"]

    # --- Gateway protection (optional) ---
    # If set, clients must send the same value in the `X-App-Token` header.
    # Keeps random callers from spending your OpenAI quota. NOT user auth.
    APP_TOKEN: Optional[str] = None

    # --- Abuse guards ---
    RATE_LIMIT_PER_MINUTE: int = 60     # requests per client IP; 0 disables
    MAX_INPUT_CHARS: int = 50_000       # reject payloads larger than this

    # --- AI ---
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    @property
    def ai_enabled(self) -> bool:
        return bool(self.OPENAI_API_KEY)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
