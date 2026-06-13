from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    default_wpm: int
    theme: str
    font_size: int
    pause_on_punctuation: bool


class SettingsUpdate(BaseModel):
    default_wpm: Optional[int] = Field(default=None, ge=30, le=1200)
    theme: Optional[str] = Field(default=None, pattern="^(dark|light)$")
    font_size: Optional[int] = Field(default=None, ge=12, le=160)
    pause_on_punctuation: Optional[bool] = None
