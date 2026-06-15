from fastapi import APIRouter, Depends

from app.api.deps import guard_length, rate_limit, verify_app_token
from app.schemas import (
    ChatOut,
    ChatRequest,
    DifficultyOut,
    KeywordsOut,
    QuizOut,
    QuizRequest,
    SimplifyOut,
    SummaryOut,
    TextRequest,
    VocabularyOut,
    VocabularyRequest,
)
from app.services import ai_service

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    dependencies=[Depends(verify_app_token), Depends(rate_limit)],
)


@router.post("/summary", response_model=SummaryOut)
def summary(payload: TextRequest) -> SummaryOut:
    guard_length(payload.text)
    return SummaryOut(summary=ai_service.generate_summary(payload.text))


@router.post("/keywords", response_model=KeywordsOut)
def keywords(payload: TextRequest) -> KeywordsOut:
    guard_length(payload.text)
    kw, difficulty = ai_service.extract_keywords(payload.text)
    return KeywordsOut(keywords=kw, difficulty_level=difficulty)


@router.post("/difficulty", response_model=DifficultyOut)
def difficulty(payload: TextRequest) -> DifficultyOut:
    guard_length(payload.text)
    return DifficultyOut(difficulty_level=ai_service.estimate_difficulty(payload.text))


@router.post("/vocabulary", response_model=VocabularyOut)
def vocabulary(payload: VocabularyRequest) -> VocabularyOut:
    definition, example = ai_service.vocabulary_help(payload.word, payload.context)
    return VocabularyOut(word=payload.word, definition=definition, example=example)


@router.post("/simplify", response_model=SimplifyOut)
def simplify(payload: TextRequest) -> SimplifyOut:
    guard_length(payload.text)
    return SimplifyOut(text=ai_service.simplify(payload.text))


@router.post("/quiz", response_model=QuizOut)
def quiz(payload: QuizRequest) -> QuizOut:
    guard_length(payload.text)
    questions = ai_service.generate_quiz(payload.text, payload.num_questions)
    return QuizOut(questions=questions)


@router.post("/chat", response_model=ChatOut)
def chat(payload: ChatRequest) -> ChatOut:
    if payload.text:
        guard_length(payload.text)
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    return ChatOut(reply=ai_service.chat(messages, payload.text))
