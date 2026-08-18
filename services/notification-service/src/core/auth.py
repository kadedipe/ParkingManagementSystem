from uuid import UUID
from fastapi import Header, HTTPException
from jose import JWTError,jwt
from .config import settings
async def current_user_id(authorization:str|None=Header(default=None))->UUID:
    if not authorization or not authorization.startswith("Bearer "): raise HTTPException(401,"Bearer token required")
    try:
        p=jwt.decode(authorization[7:],settings.JWT_SECRET,algorithms=[settings.JWT_ALGORITHM]); return UUID(str(p["user_id"]))
    except (JWTError,KeyError,ValueError): raise HTTPException(401,"Invalid authentication credentials")
