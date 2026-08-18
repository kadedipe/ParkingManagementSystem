from uuid import UUID
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt
from .config import settings

async def current_user_id(authorization: str | None = Header(default=None)) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    try:
        payload = jwt.decode(authorization[7:], settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        value = payload.get("user_id")
        if not value: raise ValueError
        return UUID(str(value))
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

def verify_internal_token(token: str | None):
    if not settings.INTERNAL_SERVICE_TOKEN or token != settings.INTERNAL_SERVICE_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid service credentials")
