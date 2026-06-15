"""Aggregate the stateless API routers."""

from fastapi import APIRouter

from app.api import ai, extract

api_router = APIRouter()
api_router.include_router(ai.router)
api_router.include_router(extract.router)
