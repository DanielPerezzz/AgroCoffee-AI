from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import token_urlsafe
from typing import Any

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings


password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)


def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def _create_token(
    *,
    subject: int,
    role: str,
    token_type: str,
    expires_delta: timedelta,
) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta

    payload = {
        "sub": str(subject),
        "role": role,
        "type": token_type,
        "jti": token_urlsafe(24),
        "iat": now,
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return token, expires_at


def create_access_token(
    *,
    subject: int,
    role: str,
) -> tuple[str, datetime]:
    return _create_token(
        subject=subject,
        role=role,
        token_type="access",
        expires_delta=timedelta(
            minutes=settings.access_token_expire_minutes,
        ),
    )


def create_refresh_token(
    *,
    subject: int,
    role: str,
) -> tuple[str, datetime]:
    return _create_token(
        subject=subject,
        role=role,
        token_type="refresh",
        expires_delta=timedelta(
            days=settings.refresh_token_expire_days,
        ),
    )


def decode_token(
    token: str,
    *,
    expected_type: str,
) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except InvalidTokenError:
        return None

    if payload.get("type") != expected_type:
        return None

    if not payload.get("sub"):
        return None

    return payload
