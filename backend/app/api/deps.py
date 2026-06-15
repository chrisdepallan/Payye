"""Stateless cross-cutting dependencies: gateway token + rate limiting."""

import time
from collections import defaultdict, deque
from typing import Deque, Dict, Optional

from fastapi import Header, HTTPException, Request, status

from app.core.config import settings


async def verify_app_token(x_app_token: Optional[str] = Header(default=None)) -> None:
    """Require the shared app token when APP_TOKEN is configured."""
    if settings.APP_TOKEN and x_app_token != settings.APP_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing app token",
        )


# Simple in-memory fixed-window limiter (per worker). Good enough for a single
# instance; put a real limiter / gateway in front for multi-instance production.
_hits: Dict[str, Deque[float]] = defaultdict(deque)


def rate_limit(request: Request) -> None:
    limit = settings.RATE_LIMIT_PER_MINUTE
    if limit <= 0:
        return

    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    window = _hits[client_ip]

    while window and now - window[0] > 60:
        window.popleft()

    if len(window) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests, slow down",
        )
    window.append(now)


def guard_length(text: str) -> str:
    """Reject oversized inputs (returns the text for convenient chaining)."""
    if len(text) > settings.MAX_INPUT_CHARS:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Text exceeds the {settings.MAX_INPUT_CHARS}-character limit",
        )
    return text
