"""Extract plain text from uploaded TXT and PDF files."""

from __future__ import annotations

import io


class UnsupportedFileType(Exception):
    pass


def detect_source_type(filename: str) -> str:
    ext = (filename or "").lower().rsplit(".", 1)[-1]
    if ext in ("txt", "text"):
        return "txt"
    if ext == "pdf":
        return "pdf"
    raise UnsupportedFileType(f"Unsupported file type: .{ext}")


def extract_text(filename: str, content: bytes) -> str:
    source_type = detect_source_type(filename)
    if source_type == "txt":
        return _extract_txt(content)
    return _extract_pdf(content)


def _extract_txt(content: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return content.decode(encoding).strip()
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="ignore").strip()


def _extract_pdf(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:  # pragma: no cover
        raise UnsupportedFileType(
            "PDF support requires the 'pypdf' package. Run: pip install pypdf"
        ) from exc

    reader = PdfReader(io.BytesIO(content))
    pages = [(page.extract_text() or "") for page in reader.pages]
    return "\n\n".join(pages).strip()
