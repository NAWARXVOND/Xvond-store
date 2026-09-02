import hmac

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def require_admin(authorization: str | None = Header(default=None)) -> None:
    expected = f"Bearer {get_settings().admin_api_token}"
    if authorization is None or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
