from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from uuid import uuid4

from src.auth.service import AuthService
from src.api.v1.users import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])

# In-memory user store (will be replaced with database)
users = {}

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    if user_data.username in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    user_id = str(uuid4())
    hashed_password = AuthService.get_password_hash(user_data.password)
    
    users[user_data.username] = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "phone_number": user_data.phone_number,
        "hashed_password": hashed_password,
        "role": user_data.role or "user",
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow()
    }
    
    access_token = AuthService.create_access_token(
        data={
            "sub": user_data.username,
            "user_id": user_id,
            "email": user_data.email,
            "role": user_data.role or "user",
            "is_admin": user_data.role == "admin"
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user_id": user_id,
        "username": user_data.username
    }

@router.post("/login")
async def login(username: str, password: str):
    user = users.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    if not AuthService.verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    access_token = AuthService.create_access_token(
        data={
            "sub": user["username"],
            "user_id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "is_admin": user["role"] == "admin"
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user_id": user["id"],
        "username": user["username"]
    }