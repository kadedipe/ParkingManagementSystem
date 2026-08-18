from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str
    user_id: str
    is_admin: bool