"""Payye stateless AI backend entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.schemas import ConfigOut

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version="0.2.0",
    description="Stateless AI service for the Payye reader (no data is stored).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["system"])
def health() -> dict:
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/config", response_model=ConfigOut, tags=["system"])
def config() -> ConfigOut:
    return ConfigOut(
        app_name=settings.APP_NAME,
        model=settings.OPENAI_MODEL,
        ai_enabled=settings.ai_enabled,
        max_input_chars=settings.MAX_INPUT_CHARS,
    )
