from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.ai_output import AIOutput
    from app.models.reading_session import ReadingSession
    from app.models.user import User


class Document(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "documents"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    # "text" (pasted), "txt" (uploaded .txt), "pdf" (uploaded .pdf)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False, default="text")
    file_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    text_content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user: Mapped["User"] = relationship(back_populates="documents")
    sessions: Mapped[List["ReadingSession"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )
    ai_output: Mapped[Optional["AIOutput"]] = relationship(
        back_populates="document", uselist=False, cascade="all, delete-orphan"
    )
