"""Stateless text extraction: upload a TXT/PDF, get text back, nothing stored."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import rate_limit, verify_app_token
from app.core.config import settings
from app.schemas import ExtractOut
from app.services import text_extraction, tokenizer

router = APIRouter(
    tags=["utility"],
    dependencies=[Depends(verify_app_token), Depends(rate_limit)],
)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/extract", response_model=ExtractOut)
async def extract(file: UploadFile = File(...)) -> ExtractOut:
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
            status_code=422, detail="No readable text could be extracted"
        )
    if len(text) > settings.MAX_INPUT_CHARS:
        # Keep the reader responsive; trim very large documents.
        text = text[: settings.MAX_INPUT_CHARS]

    return ExtractOut(
        text=text,
        word_count=tokenizer.count_words(text),
        source_type=source_type,
    )
