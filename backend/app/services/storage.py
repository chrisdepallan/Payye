"""File storage abstraction.

Defaults to the local filesystem so uploads work with zero setup. Set
STORAGE_BACKEND=s3 (plus the S3_* settings) to use S3 or MinIO instead.
"""

import os
import uuid
from pathlib import Path

from app.core.config import settings


def _safe_name(filename: str) -> str:
    base = os.path.basename(filename or "file")
    return f"{uuid.uuid4().hex}_{base}"


def save_file(filename: str, content: bytes) -> str:
    """Persist bytes and return a retrievable URL/path."""
    key = _safe_name(filename)

    if settings.STORAGE_BACKEND == "s3":
        return _save_s3(key, content)

    return _save_local(key, content)


def _save_local(key: str, content: bytes) -> str:
    directory = Path(settings.LOCAL_STORAGE_DIR)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / key
    path.write_bytes(content)
    return f"file://{path.resolve()}"


def _save_s3(key: str, content: bytes) -> str:
    import boto3  # imported lazily so boto3 is optional

    client = boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION,
    )
    client.put_object(Bucket=settings.S3_BUCKET, Key=key, Body=content)

    if settings.S3_ENDPOINT_URL:  # MinIO style
        return f"{settings.S3_ENDPOINT_URL.rstrip('/')}/{settings.S3_BUCKET}/{key}"
    return f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{key}"
