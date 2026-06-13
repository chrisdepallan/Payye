"""Application configuration loaded from environment / .env file."""

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- App ---
    APP_NAME: str = "Payye"
    DEBUG: bool = True

    # --- Security ---
    # Override SECRET_KEY in production (e.g. `openssl rand -hex 32`).
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- Database ---
    # SQLite by default so the app runs with zero setup.
    # For Postgres: postgresql+psycopg://user:pass@localhost:5432/payye
    DATABASE_URL: str = "sqlite:///./payye.db"

    # --- CORS ---
    CORS_ORIGINS: List[str] = ["*"]

    # --- Storage (S3 / MinIO) ---
    STORAGE_BACKEND: str = "local"  # "local" | "s3"
    LOCAL_STORAGE_DIR: str = "./storage"
    S3_ENDPOINT_URL: Optional[str] = None  # set for MinIO, leave empty for AWS
    S3_BUCKET: str = "payye"
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_REGION: str = "us-east-1"

    # --- AI ---
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

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
