import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db
from models import AdminUser

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
    tokenUrl="/api/auth/login"
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


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()

    now = datetime.now(timezone.utc)

    expire = (
        now + expires_delta
        if expires_delta
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
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )

        username = payload.get("sub")

        if (not isinstance(username, str) or not username
                or type(payload["iat"]) is not int
                or type(payload["exp"]) is not int
                or payload["exp"] <= payload["iat"]):
            raise credentials_exception

    except (jwt.PyJWTError, ValueError, TypeError, OverflowError):
        raise credentials_exception

    admin = (
        db.query(AdminUser)
        .filter(
            AdminUser.username == username,
            AdminUser.is_active == True,
        )
        .first()
    )

    if not admin:
        raise credentials_exception

    return admin