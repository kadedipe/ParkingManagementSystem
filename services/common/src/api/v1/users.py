from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID, uuid4

from src.auth.service import AuthService

router = APIRouter(prefix="/users", tags=["users"])

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

# In-memory storage (will be replaced with database)
users = {}

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    user_id = uuid4()
    now = datetime.now()
    
    # Hash the password
    hashed_password = AuthService.get_password_hash(user.password)
    
    new_user = {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "role": user.role or "user",
        "is_active": True,
        "is_verified": False,
        "created_at": now
    }
    users[str(user_id)] = new_user
    return new_user

@router.get("/", response_model=List[UserResponse])
async def get_users():
    return list(users.values())

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID):
    user = users.get(str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: UUID, data: dict):
    user = users.get(str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in data.items():
        if key in user and value is not None:
            user[key] = value
    return user

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: UUID):
    if str(user_id) not in users:
        raise HTTPException(status_code=404, detail="User not found")
    del users[str(user_id)]
    return None