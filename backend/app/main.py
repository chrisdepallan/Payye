"""Payye FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine

# Importing models registers their mappers so create_all sees every table.
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(_: FastAPI):
    # For development convenience we create tables on startup. In production
    # use Alembic migrations (see backend/migrations) instead.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version="0.1.0",
    description="Word-by-word reading efficiency app backend.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "app": settings.APP_NAME}
