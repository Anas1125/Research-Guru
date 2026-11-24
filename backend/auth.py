import os
import hashlib
import hmac
import json
import secrets
from time import time
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db
from models import AdminUser, AdminSession
from proxy_auth import require_cookie_proxy

load_dotenv()

def require_jwt_secret(value: str | None) -> str:
    """Never issue or accept tokens using a missing or known development key."""
    secret = value or ""
    if (
        len(secret.strip().encode("utf-8")) < 32
        or len(set(secret.strip())) < 8
        or secret.strip() == "research-guru-dev-secret-change-this"
    ):
        raise RuntimeError("Set JWT_SECRET to an independent random secret of at least 32 bytes.")
    return secret


SECRET_KEY = require_jwt_secret(os.getenv("JWT_SECRET"))

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Administrator sessions: one hour

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login", auto_error=False
)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def credential_binding(admin: AdminUser) -> str:
    # Bind tokens to the actual account and its current credentials without
    # exposing the password hash or requiring a database schema change.
    message = json.dumps(
        ["research-guru-admin-v1", admin.id, admin.username, admin.password_hash],
        separators=(",", ":"),
    ).encode("utf-8")
    return hmac.new(SECRET_KEY.encode("utf-8"), message, hashlib.sha256).hexdigest()


def create_access_token(
    admin: AdminUser,
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = {
        "sub": admin.username,
        "aid": admin.id,
        "binding": credential_binding(admin),
    }

    now = datetime.now(timezone.utc)

    expire = (
        now + expires_delta
        if expires_delta is not None
        else now + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({
        "iat": now,
        "exp": expire,
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_admin(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    if SESSION_COOKIE in request.cookies:
        return get_cookie_admin(request, db)
    if not token or not legacy_bearer_enabled():
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["sub", "aid", "binding", "iat", "exp"]},
        )

        username = payload["sub"]
        account_id = payload["aid"]
        binding = payload["binding"]

        if (not isinstance(username, str) or not username
                or type(account_id) is not int or not 0 < account_id <= 2147483647
                or not isinstance(binding, str) or len(binding) != 64
                or not binding.isascii()
                or type(payload["iat"]) is not int
                or type(payload["exp"]) is not int
                or payload["exp"] <= payload["iat"]):
            raise credentials_exception

    except (jwt.PyJWTError, ValueError, TypeError, OverflowError):
        raise credentials_exception

    admin = (
        db.query(AdminUser)
        .filter(
            AdminUser.id == account_id,
            AdminUser.username == username,
            AdminUser.is_active == True,
        )
        .first()
    )

    if not admin or not hmac.compare_digest(binding, credential_binding(admin)):
        raise credentials_exception

    return admin

SESSION_COOKIE = "__Host-rg-session"
SESSION_SECONDS = 3600


def legacy_bearer_enabled():
    return os.getenv("ALLOW_LEGACY_BEARER", "true").lower() == "true"


def session_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def revoke_admin_sessions(db: Session, admin_id: int):
    db.query(AdminSession).filter_by(admin_id=admin_id).delete(synchronize_session=False)


def start_cookie_session(request: Request, response: Response, db: Session, admin: AdminUser):
    require_cookie_proxy(request)
    previous = request.cookies.get(SESSION_COOKIE)
    if previous:
        db.query(AdminSession).filter_by(token_hash=session_digest(previous)).delete()
    now = int(time())
    db.query(AdminSession).filter(AdminSession.expires_at <= now).delete(synchronize_session=False)
    token = secrets.token_urlsafe(32)
    db.add(AdminSession(token_hash=session_digest(token), admin_id=admin.id,
                        binding=credential_binding(admin), expires_at=now + SESSION_SECONDS))
    db.commit()
    response.set_cookie(SESSION_COOKIE, token, max_age=SESSION_SECONDS, path="/",
                        secure=True, httponly=True, samesite="strict")


def get_cookie_admin(request: Request, db: Session) -> AdminUser:
    require_cookie_proxy(request)
    token = request.cookies.get(SESSION_COOKIE, "")
    error = HTTPException(401, "Session expired or invalid.")
    if len(token) != 43 or not token.isascii():
        raise error
    session = db.get(AdminSession, session_digest(token))
    if not session or session.expires_at <= int(time()):
        raise error
    admin = db.get(AdminUser, session.admin_id)
    if not admin or not admin.is_active or not hmac.compare_digest(session.binding, credential_binding(admin)):
        raise error
    return admin


def end_cookie_session(request: Request, response: Response, db: Session):
    require_cookie_proxy(request)
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        db.query(AdminSession).filter_by(token_hash=session_digest(token)).delete()
        db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/", secure=True, httponly=True, samesite="strict")
