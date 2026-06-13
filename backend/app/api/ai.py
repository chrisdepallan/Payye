from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import AIOutput, Document, User
from app.schemas import (
    AIRequest,
    KeywordsOut,
    SummaryOut,
    VocabularyOut,
    VocabularyRequest,
)
from app.services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


def _get_owned_document(document_id: str, user: User, db: Session) -> Document:
    document = db.get(Document, document_id)
    if document is None or document.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )
    return document


def _get_or_create_output(document: Document, db: Session) -> AIOutput:
    if document.ai_output is None:
        document.ai_output = AIOutput(document_id=document.id)
        db.add(document.ai_output)
    return document.ai_output


@router.post("/summary", response_model=SummaryOut)
def summary(
    payload: AIRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SummaryOut:
    document = _get_owned_document(payload.document_id, user, db)
    output = _get_or_create_output(document, db)

    if output.summary:
        return SummaryOut(document_id=document.id, summary=output.summary, cached=True)

    text = ai_service.generate_summary(document.text_content)
    output.summary = text
    output.generated_at = datetime.now(timezone.utc)
    db.commit()
    return SummaryOut(document_id=document.id, summary=text, cached=False)


@router.post("/keywords", response_model=KeywordsOut)
def keywords(
    payload: AIRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> KeywordsOut:
    document = _get_owned_document(payload.document_id, user, db)
    output = _get_or_create_output(document, db)

    if output.keywords:
        return KeywordsOut(
            document_id=document.id,
            keywords=output.keywords,
            difficulty_level=output.difficulty_level or "Intermediate",
            cached=True,
        )

    kw, difficulty = ai_service.extract_keywords(document.text_content)
    output.keywords = kw
    output.difficulty_level = difficulty
    output.generated_at = datetime.now(timezone.utc)
    db.commit()
    return KeywordsOut(
        document_id=document.id,
        keywords=kw,
        difficulty_level=difficulty,
        cached=False,
    )


@router.post("/vocabulary-help", response_model=VocabularyOut)
def vocabulary_help(
    payload: VocabularyRequest,
    user: User = Depends(get_current_user),
) -> VocabularyOut:
    if not payload.word.strip():
        raise HTTPException(status_code=400, detail="A word is required")
    definition, example = ai_service.vocabulary_help(payload.word, payload.context)
    return VocabularyOut(word=payload.word, definition=definition, example=example)
