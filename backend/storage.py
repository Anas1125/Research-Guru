"""
Persistent image storage.

Uploaded images are stored in the application database (Neon
PostgreSQL in production) instead of the local filesystem, because
Vercel serverless functions run on a read-only, ephemeral filesystem.

Images are served by GET /api/files/{folder}/{filename} with long-lived,
immutable cache headers so Vercel's edge CDN and browsers cache them.

Legacy images that were saved under backend/uploads/ before this change
are still served by the /uploads static mount in main.py.
"""

import os
from uuid import uuid4

from sqlalchemy.orm import Session

from models import StoredFile

FILES_URL_PREFIX = "/api/files"

ALLOWED_FOLDERS = {
    "site",
    "blog",
    "clients",
    "reviews",
}


def save_file(
    db: Session,
    *,
    folder: str,
    contents: bytes,
    content_type: str,
    extension: str,
    original_name: str | None = None,
) -> str:
    """Store the file and return its public URL path."""

    if folder not in ALLOWED_FOLDERS:
        raise ValueError(f"Unknown upload folder: {folder}")

    file_id = uuid4().hex
    filename = f"{file_id}{extension.lower()}"

    stored = StoredFile(
        id=file_id,
        folder=folder,
        filename=filename,
        original_name=(original_name or "")[:255] or None,
        content_type=content_type,
        size=len(contents),
        data=contents,
    )

    db.add(stored)
    db.commit()

    return f"{FILES_URL_PREFIX}/{folder}/{filename}"


def get_file(
    db: Session,
    folder: str,
    filename: str,
) -> StoredFile | None:
    file_id = os.path.splitext(filename)[0]

    if len(file_id) != 32:
        return None

    stored = db.get(StoredFile, file_id)

    if (
        not stored
        or stored.folder != folder
        or stored.filename != filename
    ):
        return None

    return stored


def delete_file_by_url(
    db: Session,
    url: str | None,
) -> bool:
    """
    Delete a stored file referenced by a URL path returned from
    save_file(). Does nothing (returns False) for any other URL.
    Does not commit; the caller commits.
    """

    if not url or not url.startswith(f"{FILES_URL_PREFIX}/"):
        return False

    parts = url[len(FILES_URL_PREFIX) + 1:].split("/")

    if len(parts) != 2:
        return False

    stored = get_file(db, parts[0], parts[1])

    if not stored:
        return False

    db.delete(stored)

    return True
