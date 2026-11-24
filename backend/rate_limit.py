"""Atomic fixed-window rate limiting shared by all API instances."""
import hashlib
import hmac
import ipaddress
import logging
import os
import secrets
from time import time

from fastapi import HTTPException, Request
from sqlalchemy import delete, select, tuple_
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.exc import SQLAlchemyError

from auth import SECRET_KEY
from database import SessionLocal
from models import RateLimitBucket

logger = logging.getLogger(__name__)


def client_identity(request: Request) -> str:
    # Only trust the Vercel-managed header when running on Vercel.
    # Do not trust arbitrary caller-supplied X-Forwarded-For or CF headers.
    if os.getenv("VERCEL") == "1":
        raw = request.headers.get("x-vercel-forwarded-for", "")
    else:
        raw = request.client.host if request.client else ""
    try:
        ip = ipaddress.ip_address(raw.strip())
        if isinstance(ip, ipaddress.IPv6Address):
            if ip.ipv4_mapped:
                return str(ip.ipv4_mapped)
            # Group IPv6 privacy addresses by /64.
            return str(ipaddress.ip_network((ip, 64), strict=False))
        return str(ip)
    except ValueError:
        # A missing or malformed proxy identity shares a conservative bucket.
        return "unknown"


def bucket_key(scope: str, identity: str) -> str:
    return hmac.new(
        SECRET_KEY.encode("utf-8"),
        ("rate-limit-v1:" + scope + ":" + identity).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def cleanup_expired(now: int) -> None:
    """Bounded opportunistic cleanup; never remove live windows."""
    with SessionLocal.begin() as db:
        table = RateLimitBucket.__table__
        expired = (
            select(table.c.key, table.c.window_start)
            .where(table.c.expires_at <= now)
            .order_by(table.c.expires_at)
            .limit(500)
        )
        db.execute(delete(table).where(
            tuple_(table.c.key, table.c.window_start).in_(expired),
            table.c.expires_at <= now,
        ))


def consume(scope: str, identity: str, limit: int, seconds: int) -> None:
    now = int(time())
    start = now - now % seconds
    end = start + seconds
    key = bucket_key(scope, identity)
    table = RateLimitBucket.__table__

    try:
        # This transaction is independent of the endpoint's business transaction.
        # Failed logins, validation errors and rollbacks cannot undo the counter.
        with SessionLocal.begin() as db:
            dialect = db.get_bind().dialect.name
            if dialect == "postgresql":
                insert = pg_insert
            elif dialect == "sqlite":
                insert = sqlite_insert
            else:
                raise RuntimeError("Unsupported rate limit database")
            stmt = insert(table).values(
                key=key, window_start=start, expires_at=end, count=1,
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=[table.c.key, table.c.window_start],
                set_={"count": table.c.count + 1},
                where=table.c.count < limit,
            ).returning(table.c.count)
            allowed = db.execute(stmt).scalar_one_or_none() is not None
    except (SQLAlchemyError, RuntimeError):
        logger.error("Rate limit database unavailable")
        # Fail closed rather than permitting unlimited attempts or submissions.
        raise HTTPException(
            status_code=503, detail="Temporarily unavailable. Please try again.",
            headers={"Retry-After": "30", "Cache-Control": "no-store"},
        ) from None

    # Cleanup in a separate transaction so an unrelated cleanup failure does
    # not undo a successfully recorded request.
    if secrets.randbelow(32) == 0:
        try:
            cleanup_expired(now)
        except SQLAlchemyError:
            logger.warning("Rate limit cleanup failed")

    if not allowed:
        raise HTTPException(
            status_code=429, detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(max(1, end - now)), "Cache-Control": "no-store"},
        )


def limit_login_ip(request: Request) -> None:
    consume("login-ip", client_identity(request), 5, 60)


def limit_login_account(username: str) -> None:
    # Same bucket policy for existing and nonexistent usernames.
    consume("login-account", username.strip().casefold(), 10, 900)


def limit_contact(request: Request) -> None:
    consume("contact", client_identity(request), 5, 600)


def limit_review(request: Request) -> None:
    consume("review", client_identity(request), 3, 600)


def limit_offer(request: Request) -> None:
    consume("offer", client_identity(request), 20, 60)
