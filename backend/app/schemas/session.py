from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.document import DocumentOut


class SessionStart(BaseModel):
    document_id: str
    wpm: Optional[int] = Field(default=None, ge=30, le=1200)


class SessionUpdate(BaseModel):
    current_word_index: Optional[int] = Field(default=None, ge=0)
    wpm: Optional[int] = Field(default=None, ge=30, le=1200)
    status: Optional[str] = Field(default=None, pattern="^(active|paused|completed)$")


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    current_word_index: int
    wpm: int
    status: str
    started_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class SessionWithDocument(SessionOut):
    document: DocumentOut
