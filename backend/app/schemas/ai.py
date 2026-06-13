from typing import List, Optional

from pydantic import BaseModel


class AIRequest(BaseModel):
    document_id: str


class VocabularyRequest(BaseModel):
    word: str
    context: Optional[str] = None


class SummaryOut(BaseModel):
    document_id: str
    summary: str
    cached: bool = False


class KeywordsOut(BaseModel):
    document_id: str
    keywords: List[str]
    difficulty_level: str
    cached: bool = False


class VocabularyOut(BaseModel):
    word: str
    definition: str
    example: Optional[str] = None
