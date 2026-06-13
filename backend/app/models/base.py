"""Shared model mixins."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UUIDMixin:
    """String-backed UUID primary key (portable across SQLite and Postgres)."""

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
