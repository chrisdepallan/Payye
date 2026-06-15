from typing import List, Optional

from pydantic import BaseModel, Field


# --- Requests ---
class TextRequest(BaseModel):
    text: str = Field(min_length=1)


class VocabularyRequest(BaseModel):
    word: str = Field(min_length=1, max_length=128)
    context: Optional[str] = None


class QuizRequest(TextRequest):
    num_questions: int = Field(default=5, ge=1, le=20)


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    # Optional passage the conversation is about.
    text: Optional[str] = None
    messages: List[ChatMessage] = Field(min_length=1)


# --- Responses ---
class SummaryOut(BaseModel):
    summary: str


class KeywordsOut(BaseModel):
    keywords: List[str]
    difficulty_level: str


class DifficultyOut(BaseModel):
    difficulty_level: str


class VocabularyOut(BaseModel):
    word: str
    definition: str
    example: Optional[str] = None


class SimplifyOut(BaseModel):
    text: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer_index: int
    explanation: Optional[str] = None


class QuizOut(BaseModel):
    questions: List[QuizQuestion]


class ChatOut(BaseModel):
    reply: str


class ExtractOut(BaseModel):
    text: str
    word_count: int
    source_type: str


class ConfigOut(BaseModel):
    app_name: str
    model: str
    ai_enabled: bool
    max_input_chars: int
