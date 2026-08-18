from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from .jwt_handler import JWTHandler
from .models import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    secret_key: str = "your-secret-key"
) -> TokenData:
    handler = JWTHandler(secret_key)
    try:
        payload = handler.decode_token(token)
        user_id = payload.get("user_id")
        username = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "user")
        is_admin = payload.get("is_admin", False)
        
        if user_id is None or username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        return TokenData(
            user_id=user_id,
            username=username,
            email=email,
            role=role,
            is_admin=is_admin
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_active_user(current_user: TokenData = Depends(get_current_user)):
    return current_user

async def get_current_admin_user(current_user: TokenData = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user