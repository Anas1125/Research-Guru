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

SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "research-guru-dev-secret-change-this",
)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

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
        )

        username = payload.get("sub")

        if not username:
            raise credentials_exception

    except jwt.PyJWTError:
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