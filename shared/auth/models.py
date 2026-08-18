from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class TokenData(BaseModel):
    user_id: str
    username: str
    email: str
    role: str = "user"
    is_admin: bool = False

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone_number: Optional[str] = None
    role: Optional[str] = "user"

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    full_name: str
    phone_number: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse