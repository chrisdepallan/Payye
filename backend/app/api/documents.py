from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Document, User
from app.schemas import DocumentCreate, DocumentDetail, DocumentOut
from app.services import text_extraction, storage, tokenizer

router = APIRouter(prefix="/documents", tags=["documents"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


def _get_owned_document(document_id: str, user: User, db: Session) -> Document:
    document = db.get(Document, document_id)
    if document is None or document.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )
    return document


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DocumentOut:
    document = Document(
        user_id=user.id,
        title=payload.title,
        source_type="text",
        text_content=payload.text_content,
        word_count=tokenizer.count_words(payload.text_content),
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return DocumentOut.model_validate(document)


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DocumentOut:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    try:
        source_type = text_extraction.detect_source_type(file.filename or "")
        text = text_extraction.extract_text(file.filename or "", content)
    except text_extraction.UnsupportedFileType as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(
            status_code=422, detail="No readable text could be extracted from the file"
        )

    file_url = storage.save_file(file.filename or "upload", content)
    title = (file.filename or "Untitled").rsplit(".", 1)[0]

    document = Document(
        user_id=user.id,
        title=title,
        source_type=source_type,
        file_url=file_url,
        text_content=text,
        word_count=tokenizer.count_words(text),
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return DocumentOut.model_validate(document)


@router.get("", response_model=list[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[DocumentOut]:
    documents = db.scalars(
        select(Document)
        .where(Document.user_id == user.id)
        .order_by(Document.created_at.desc())
    ).all()
    return [DocumentOut.model_validate(d) for d in documents]


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DocumentDetail:
    document = _get_owned_document(document_id, user, db)
    return DocumentDetail.model_validate(document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    document = _get_owned_document(document_id, user, db)
    db.delete(document)
    db.commit()
