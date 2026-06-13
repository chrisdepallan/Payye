from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserSettings(UUIDMixin, Base):
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    default_wpm: Mapped[int] = mapped_column(Integer, default=250, nullable=False)
    theme: Mapped[str] = mapped_column(String(16), default="dark", nullable=False)
    font_size: Mapped[int] = mapped_column(Integer, default=48, nullable=False)
    pause_on_punctuation: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="settings")
