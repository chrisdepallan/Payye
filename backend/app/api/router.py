"""Aggregate all API routers under a single router."""

from fastapi import APIRouter

from app.api import ai, auth, documents, sessions, settings

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(documents.router)
api_router.include_router(sessions.router)
api_router.include_router(settings.router)
api_router.include_router(ai.router)
