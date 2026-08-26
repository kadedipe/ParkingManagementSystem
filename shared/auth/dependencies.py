import os

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .jwt_handler import JWTHandler
from .models import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def _jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")
    if not secret or len(secret) < 32:
        raise RuntimeError("JWT_SECRET_KEY must be configured with at least 32 characters")
    return secret


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    try:
        payload = JWTHandler(_jwt_secret()).decode_token(token)
        user_id = payload.get("user_id")
        username = payload.get("sub")
        if user_id is None or username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenData(
            user_id=user_id,
            username=username,
            email=payload.get("email"),
            role=payload.get("role", "user"),
            is_admin=bool(payload.get("is_admin", False)),
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(current_user: TokenData = Depends(get_current_user)):
    return current_user


async def get_current_admin_user(current_user: TokenData = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
