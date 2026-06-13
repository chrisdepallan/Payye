from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models import Document, ReadingSession, User
from app.core.database import get_db
from app.schemas import SessionOut, SessionStart, SessionUpdate, SessionWithDocument

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _get_owned_session(session_id: str, user: User, db: Session) -> ReadingSession:
    session = db.get(ReadingSession, session_id)
    if session is None or session.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


@router.post("/start", response_model=SessionWithDocument)
def start_session(
    payload: SessionStart,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SessionWithDocument:
    document = db.get(Document, payload.document_id)
    if document is None or document.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )

    default_wpm = user.settings.default_wpm if user.settings else 250
    wpm = payload.wpm or default_wpm

    # Resume an in-progress session for this document if one exists.
    session = db.scalar(
        select(ReadingSession)
        .where(
            ReadingSession.user_id == user.id,
            ReadingSession.document_id == document.id,
            ReadingSession.status != "completed",
        )
        .order_by(ReadingSession.updated_at.desc())
    )

    if session is None:
        session = ReadingSession(
            user_id=user.id,
            document_id=document.id,
            current_word_index=0,
            wpm=wpm,
            status="active",
        )
        db.add(session)
    else:
        session.status = "active"
        if payload.wpm:
            session.wpm = payload.wpm

    db.commit()
    db.refresh(session)
    return SessionWithDocument.model_validate(session)


@router.patch("/{session_id}", response_model=SessionOut)
def update_session(
    session_id: str,
    payload: SessionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SessionOut:
    session = _get_owned_session(session_id, user, db)

    if payload.current_word_index is not None:
        session.current_word_index = payload.current_word_index
    if payload.wpm is not None:
        session.wpm = payload.wpm
    if payload.status is not None:
        session.status = payload.status
        if payload.status == "completed":
            session.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)
    return SessionOut.model_validate(session)


@router.get("/current", response_model=SessionWithDocument | None)
def current_session(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SessionWithDocument | None:
    session = db.scalar(
        select(ReadingSession)
        .where(
            ReadingSession.user_id == user.id,
            ReadingSession.status != "completed",
        )
        .order_by(ReadingSession.updated_at.desc())
    )
    if session is None:
        return None
    return SessionWithDocument.model_validate(session)


@router.get("/history", response_model=list[SessionWithDocument])
def session_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[SessionWithDocument]:
    sessions = db.scalars(
        select(ReadingSession)
        .where(ReadingSession.user_id == user.id)
        .order_by(ReadingSession.updated_at.desc())
    ).all()
    return [SessionWithDocument.model_validate(s) for s in sessions]
